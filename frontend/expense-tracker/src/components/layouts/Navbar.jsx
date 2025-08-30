import { useState } from 'react';
import { HiOutlineMenuAlt3, HiOutlineX } from 'react-icons/hi';
import SideMenu from './SideMenu';

const Navbar = ({ activeMenu }) => {
  const [openSideMenu, setOpenSideMenu] = useState(false);

  return (
    <div className="flex items-center justify-between px-4 py-2 shadow-md bg-white">
      <button onClick={() => setOpenSideMenu(!openSideMenu)}>
        {openSideMenu ? (
          <HiOutlineX className="text-3xl" />
        ) : (
          <HiOutlineMenuAlt3 className="text-3xl" />
        )}
      </button>

      <h2 className="text-xl font-semibold">Expense Tracker</h2>

      {openSideMenu && (
        <div className="absolute top-16 left-0 w-64 h-screen bg-white z-10 p-4 shadow-lg">
  <SideMenu activeMenu={activeMenu} />
</div>

      )}
    </div>
  );
};

export default Navbar;
