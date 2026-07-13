import { redirect } from 'next/navigation';

export default function Home() {
  // Para fins de teste ágil visual, mandar direto pra tela principal logada
  redirect('/dashboard');
}
