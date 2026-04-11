/**
 * Hello World
 *
 * The simplest possible Salesforce web application component — a plain React
 * function component.
 *
 * @see BindingAccountName — fetching and binding Salesforce data
 */
export default function HelloWorld() {
  const greeting = 'World';

  return <p className="text-sm">Hello, {greeting}!</p>;
}
