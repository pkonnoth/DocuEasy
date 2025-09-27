import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the EMR dashboard
  redirect('/patients');
}
