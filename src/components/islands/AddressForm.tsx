import { useState, type FormEvent } from 'react';
import type { Address, AddressType } from '../../lib/domain/types';
import { actions } from 'astro:actions';
import { Field, Notice, failureOf, fieldErrorsOf } from './ui';

interface Props {
  type: AddressType;
  onSaved: (address: Address) => void;
  onCancel?: () => void;
}

export default function AddressForm({ type, onSaved, onCancel }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? '').trim();
    setBusy(true);
    setError('');
    setFields({});
    const { data, error: failure } = await actions.addresses.create({
      addressType: type,
      streetAddress: v('streetAddress'),
      apartment: v('apartment') || null,
      city: v('city'),
      stateProvince: v('stateProvince'),
      postalCode: v('postalCode'),
      country: v('country'),
      isDefault: f.get('isDefault') === 'on',
    });
    setBusy(false);
    if (failure) {
      setFields(fieldErrorsOf(failure));
      setError(failureOf(failure));
      return;
    }
    if (data.invalid) {
      setFields(data.invalid.fieldErrors);
      setError(data.invalid.message);
      return;
    }
    onSaved(data.address);
  }

  const input = (name: string, label: string, autoComplete: string, opts: { required?: boolean; defaultValue?: string } = {}) => (
    <Field label={label} error={fields[name]}>
      <input
        className="input"
        name={name}
        autoComplete={autoComplete}
        required={opts.required ?? true}
        defaultValue={opts.defaultValue}
        aria-invalid={!!fields[name]}
      />
    </Field>
  );

  return (
    <form className="address-form" onSubmit={submit} noValidate>
      {error && <Notice tone="error">{error}</Notice>}
      {input('streetAddress', 'Street address', 'address-line1')}
      {input('apartment', 'Apartment, suite (optional)', 'address-line2', { required: false })}
      <div className="address-form__row">
        {input('city', 'City', 'address-level2')}
        {input('stateProvince', 'State', 'address-level1')}
        {input('postalCode', 'ZIP code', 'postal-code')}
      </div>
      {input('country', 'Country', 'country-name', { defaultValue: 'United States' })}
      <label className="check">
        <input type="checkbox" name="isDefault" /> Use as my default {type === 'SHIPPING' ? 'shipping' : 'billing'} address
      </label>
      <div className="address-form__actions">
        <button className="btn btn--act" disabled={busy}>
          {busy ? 'Saving…' : 'Save address'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn--quiet" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
      <style>{`
        .address-form { display: grid; gap: 14px; }
        .address-form__row { display: grid; grid-template-columns: 2fr 1.2fr 1fr; gap: 12px; }
        .address-form__actions { display: flex; gap: 8px; }
        .check { display: flex; align-items: center; gap: 8px; font-size: .8125rem; }
        .check input { accent-color: var(--goldenrod); width: 16px; height: 16px; }
        @media (max-width: 560px) { .address-form__row { grid-template-columns: 1fr; } }
      `}</style>
    </form>
  );
}

export function formatAddress(a: Address): string {
  return [a.streetAddress, a.apartment, `${a.city}, ${a.stateProvince} ${a.postalCode}`, a.country].filter(Boolean).join(', ');
}
