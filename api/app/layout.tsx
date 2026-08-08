// Minimal root layout required by Next.js App Router.
// This project is API-only; there are no UI pages served here.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
