import './Button.css';

export function Button({ children, variant = 'primary', type = 'button', className = '', as: Component = 'button', ...props }) {
  const isButton = Component === 'button';
  return (
    <Component
      type={isButton ? type : undefined}
      className={`btn btn--${variant} ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}
