// hooks/useForm.ts
import { useState, useCallback } from "react";
import { z, ZodType, ZodObject } from "zod";

type FormErrors<T> = Partial<Record<keyof T, string>>;

interface UseFormProps<T> {
  initialValues: T;
  schema: ZodType<any, any, T>;
  onSubmit: (values: T) => void | Promise<void>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  schema,
  onSubmit,
}: UseFormProps<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input change
  const handleChange = useCallback(
    (field: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [field]: value }));

      // Clear field error when user types
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // Validate a single field
  const validateField = useCallback(
    (field: keyof T, value: any) => {
      try {
        // Create a schema for just this field - safer approach that doesn't rely on .shape
        // const fieldSchema = z.object({ [field as string]: z.any() });
        // fieldSchema.parse({ [field]: value });

        if (schema instanceof z.ZodObject) {
          const fieldSchema = z.object({
            [field as string]: (schema.shape as Record<string, z.ZodTypeAny>)[
              field as string
            ],
          });
          fieldSchema.parse({ [field]: value });
        } else {
          // Fallback: validate whole form if schema isn't a ZodObject
          schema.parse({ ...values, [field]: value });
        }

        // Clear error if validation passes
        if (errors[field]) {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
          });
        }

        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Extract the error message for this field
          const fieldError = error.errors.find((e) => e.path[0] === field);

          if (fieldError) {
            setErrors((prev) => ({
              ...prev,
              [field]: fieldError.message,
            }));
          }
        }
        return false;
      }
    },
    [errors]
  );

  // Validate the entire form
  const validateForm = useCallback(() => {
    try {
      schema.parse(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: FormErrors<T> = {};

        error.errors.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0] as keyof T] = err.message;
          }
        });

        setErrors(formattedErrors);
      }
      return false;
    }
  }, [values, schema]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      if (validateForm()) {
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } catch (error) {
          console.error("Form submission error:", error);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [values, validateForm, onSubmit]
  );

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  // Set form values programmatically
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Set multiple form values programmatically
  const setFieldValues = useCallback((newValues: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    validateField,
    validateForm,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldValues,
  };
}

export default useForm;

// Alternative validateField implementation with type checking
// const validateField = useCallback((field: keyof T, value: any) => {
//   try {
//     // Check if schema is a ZodObject before accessing shape
//     if (schema instanceof z.ZodObject) {
//       const fieldSchema = z.object({
//         [field as string]: schema.shape[field as string]
//       });
//       fieldSchema.parse({ [field]: value });
//     } else {
//       // If not a ZodObject, validate the whole form
//       schema.parse(values);
//     }

//     // Clear error if validation passes
//     if (errors[field]) {
//       setErrors(prev => {
//         const newErrors = { ...prev };
//         delete newErrors[field];
//         return newErrors;
//       });
//     }

//     return true;
//   } catch (error) {
//     // Error handling...
//   }
// }, [errors, schema, values]);
