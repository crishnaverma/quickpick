export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatTime = (timeStr) => {
  if (!timeStr) return '';
  if (timeStr.includes(':')) {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
  }
  return timeStr;
};

export const ORDER_STATUS_CONFIG = {
  PLACED: {
    label: 'Order Placed',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    dot: 'bg-blue-500',
    description: 'We received your order and are confirming item availability.',
    step: 1,
  },
  ACCEPTED: {
    label: 'Order Accepted',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    dot: 'bg-indigo-500',
    description: 'Store confirmed your order. Queueing for preparation.',
    step: 2,
  },
  PREPARING: {
    label: 'Preparing Groceries',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    description: 'Our team is handpicking your fresh groceries into your bag.',
    step: 3,
  },
  READY: {
    label: 'Ready for Collection',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold',
    dot: 'bg-emerald-500 animate-pulse',
    description: 'Your groceries are packed and waiting at the QuickPick counter!',
    step: 4,
  },
  COLLECTED: {
    label: 'Collected',
    color: 'bg-slate-100 text-slate-800 border-slate-300',
    dot: 'bg-slate-500',
    description: 'Order handed over successfully. Thank you for shopping with us!',
    step: 5,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-rose-100 text-rose-800 border-rose-200',
    dot: 'bg-rose-500',
    description: 'This order was cancelled and inventory was released.',
    step: 0,
  },
  REJECTED: {
    label: 'Rejected',
    color: 'bg-rose-100 text-rose-800 border-rose-200',
    dot: 'bg-rose-500',
    description: 'Store was unable to fulfill this order.',
    step: 0,
  },
};
