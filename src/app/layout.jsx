import Link from "next/link";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header>
          <nav>
            <Link className="nav-link" href="/">
              Home
            </Link>
            <div>
              <Link className="nav-link" href="/dashboard">
                Dashboard
              </Link>
              <Link className="nav-link" href="/register">
                Register
              </Link>
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <footer>Footer</footer>
      </body>
    </html>
  );
}
