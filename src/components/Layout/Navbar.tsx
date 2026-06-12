import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  PlusCircle,
  ClipboardList,
  Wallet,
  MessageSquare,
  MapPin,
  Car,
  Building2,
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { useWalletStore } from '@/store/useWalletStore';

export default function Navbar() {
  const navigate = useNavigate();
  const { currentUser, switchRole } = useUserStore();
  const balance = useWalletStore((s) => s.getBalance(currentUser.id));

  const renterLinks = [
    { to: '/', icon: Home, label: '找车位' },
    { to: '/orders', icon: ClipboardList, label: '我的订单' },
    { to: '/wallet', icon: Wallet, label: '我的钱包' },
    { to: '/reviews', icon: MessageSquare, label: '信用评价' },
  ];

  const ownerLinks = [
    { to: '/', icon: Home, label: '车位管理' },
    { to: '/publish', icon: PlusCircle, label: '发布车位' },
    { to: '/my-spots', icon: MapPin, label: '我的车位' },
    { to: '/wallet', icon: Wallet, label: '我的钱包' },
    { to: '/reviews', icon: MessageSquare, label: '信用评价' },
  ];

  const links = currentUser.role === 'owner' ? ownerLinks : renterLinks;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-100">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Car size={20} className="text-white" />
              </div>
              <span className="text-lg font-bold text-slate-800">
                邻里车位
              </span>
            </button>

            <nav className="hidden md:flex items-center gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'nav-link-active' : ''}`
                  }
                >
                  <link.icon size={18} />
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => switchRole('renter')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  currentUser.role === 'renter'
                    ? 'bg-white shadow-sm text-primary-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Car size={16} />
                车主
              </button>
              <button
                onClick={() => switchRole('owner')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  currentUser.role === 'owner'
                    ? 'bg-white shadow-sm text-primary-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Building2 size={16} />
                业主
              </button>
            </div>

            <button
              onClick={() => navigate('/wallet')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 text-sm font-medium hover:bg-primary-100 transition-colors"
            >
              <Wallet size={16} />
              ¥{balance.toFixed(2)}
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full bg-slate-200"
              />
              <span className="hidden sm:block text-sm font-medium text-slate-700">
                {currentUser.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      <nav className="md:hidden border-t border-slate-100">
        <div className="container flex justify-around py-2">
          {links.slice(0, 4).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-2 py-1 text-xs ${
                  isActive ? 'text-primary-600' : 'text-slate-500'
                }`
              }
            >
              <link.icon size={20} />
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
