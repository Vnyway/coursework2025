import React from "react";
import { Link } from "react-router-dom";
import { links } from "../constants";

const Header = () => {
  return (
    <header>
      <div className="container mx-auto h-[100px] flex justify-between items-center text-[25px] font-bold">
        {links.map((l) => (
          <Link
            id={l.id}
            style={{ transition: "all ease-out .3s" }}
            to={l.path}
            className="flex justify-center hover:text-blue-500 outline-none">
            {l.name}
          </Link>
        ))}
      </div>
    </header>
  );
};

export default Header;
