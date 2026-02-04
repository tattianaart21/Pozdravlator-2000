import './Card.css';

export function Card({ children, className = '', as, ...props }) {
  const Wrapper = as ?? 'div';
  return (
    <Wrapper className={`card ${className}`.trim()} {...props}>
      {children}
    </Wrapper>
  );
}
