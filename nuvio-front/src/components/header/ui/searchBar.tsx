import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export function SearchBar() {
  return (
    <div className="flex items-center gap-3 focus-within:rounded-(--radius) rounded-sm px-1.5 py-1.5  transition-all w-full max-w-md bg-(--searchbar-bg) border border-(--searchbar-border) focus-within:ring-1 focus-within:ring-(--searchbar-focus-ring)">

      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-(--searchbar-bg) text-(--searchbar-text) cursor-pointer shrink-0 hover:bg-(--hoverbg) transition-colors">
        
        <FontAwesomeIcon icon={faMagnifyingGlass} className="w-3 h-4" />
      </div>

      {/* Input Field */}
      <input
        type="text"
        placeholder="Buscar..."
        className="outline-none w-full  text-(--searchbar-text) placeholder:(--searchbar-placeholder) py-1"
      />
    </div>
  );
}