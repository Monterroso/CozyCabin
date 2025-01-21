import { UseFormRegister, FieldErrors, Path, FieldValues } from 'react-hook-form';

interface FormInputProps<T extends FieldValues> {
  id: Path<T>;
  label: string;
  type?: string;
  placeholder?: string;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  required?: boolean;
}

export const FormInput = <T extends FieldValues>({
  id,
  label,
  type = 'text',
  placeholder,
  register,
  errors,
  required = false,
}: FormInputProps<T>) => {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-200"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        {...register(id)}
        className={`block w-full rounded-md border ${
          errors[id]
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-primary focus:ring-primary'
        } p-2.5 text-gray-900 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400`}
      />
      {errors[id] && (
        <p className="mt-1 text-sm text-red-500">
          {errors[id]?.message as string}
        </p>
      )}
    </div>
  );
}; 