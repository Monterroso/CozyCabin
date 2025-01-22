import { UseFormRegister, FieldErrors, Path, FieldValues } from 'react-hook-form';

interface FormInputProps<T extends FieldValues> {
  id: Path<T>;
  label: string;
  type?: string;
  placeholder?: string;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  required?: boolean;
  disabled?: boolean;
}

export const FormInput = <T extends FieldValues>({
  id,
  label,
  type = 'text',
  placeholder,
  register,
  errors,
  required = false,
  disabled = false,
}: FormInputProps<T>) => {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-foreground dark:text-foreground"
      >
        {label}
        {required && <span className="text-ember-orange ml-1">*</span>}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        {...register(id)}
        disabled={disabled}
        className={`block w-full rounded-md ${
          errors[id]
            ? 'border-ember-orange focus:border-ember-orange focus:ring-ember-orange'
            : 'border-input focus:border-pine-green focus:ring-pine-green'
        } p-2.5 text-foreground shadow-sm dark:border-input dark:bg-background dark:text-foreground dark:placeholder-muted-foreground disabled:cursor-not-allowed disabled:opacity-50`}
      />
      {errors[id] && (
        <p className="mt-1 text-sm text-ember-orange">
          {errors[id]?.message as string}
        </p>
      )}
    </div>
  );
}; 