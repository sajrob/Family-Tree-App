import React from "react";
import { Link } from "react-router-dom";

function SiteButton({ to, onClick, children, color = "blue", className = "" }) {
  const baseClasses =
    "text-white py-2 px-4 rounded transition duration-200 ease-in-out";
  const colorClasses = {
    blue: "bg-indigo-600 hover:bg-indigo-800",
    green: "bg-green-600 hover:bg-green-800",
    red: "bg-red-500 hover:bg-red-600",
    yellow: "bg-yellow-500 hover:bg-yellow-600",
  };

  const buttonClasses = `${baseClasses} ${colorClasses[color]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={buttonClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={buttonClasses}>
      {children}
    </button>
  );
}

export default SiteButton;
