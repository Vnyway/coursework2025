import { Link } from "react-router-dom";
import { links } from "../constants";

const Header = () => {
  return (
    <header className="bg-white shadow rounded-b-lg mb-6">
      <div className="max-w-5xl mx-auto px-4 min-h-[72px] flex items-center justify-between overflow-x-auto">
        <div className="text-xl font-bold text-blue-700 tracking-tight">
          <span className="hidden sm:inline">Курсова робота 2025</span>
          <span className="sm:hidden">КР2025</span>
        </div>
        <nav className="flex gap-4">
          {links.map((l) => (
            <Link
              key={l.id}
              to={l.path}
              className="px-3 py-1 rounded text-gray-800 font-semibold hover:bg-blue-50 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300">
              <span className="hidden sm:inline">{l.name}</span>
              <span className="sm:hidden">{l.shortName}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
