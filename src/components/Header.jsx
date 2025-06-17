import { Link } from "react-router-dom";
import { links } from "../constants";

const Header = () => {
  return (
    <header className="bg-white shadow rounded-b-lg mb-6">
      <div className="max-w-5xl mx-auto px-4 h-[72px] flex items-center justify-between">
        <div className="text-xl font-bold text-blue-700 tracking-tight">
          Курсова робота 2025
        </div>
        <nav className="flex gap-4">
          {links.map((l) => (
            <Link
              key={l.id}
              to={l.path}
              className="px-3 py-1 rounded text-gray-800 font-semibold hover:bg-blue-50 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300">
              {l.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
