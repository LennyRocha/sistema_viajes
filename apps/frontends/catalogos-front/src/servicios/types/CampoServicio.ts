export default interface CampoConfig<T> {
  clave: string;

  label: string;

  tipo: "text" | "number" | "boolean";

  inputTipo?:
    | "text"
    | "textarea"
    | "number"
    | "checkbox"
    | "select"
    | "radio"
    | "switch";

  requerido?: boolean;

  min?: number;

  max?: number;

  minLength?: number;

  maxLength?: number;

  regex?: RegExp;

  placeholder?: string;

  defaultValue?: T;

  visible?: {
    campo: string;
    valor: string | number | boolean;
  };

  opciones?: string | number[];
}
