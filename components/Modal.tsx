import{ ReactNode, useEffect} from 'react';

export default function Modal ({open,title,onClose,children,}:{
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
    useEffect (() => {
        const onEsc = (e: KeyboardEvent) => {if (e.key === 'Escape') onClose()};
        
        if (open) window.addEventListener('keydown', onEsc);
        return () => window.removeEventListener('keydown', onEsc);
    }, [open, onClose]);

    if(!open) return null;

    return (
        
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="w-full max-w-lg rounded bg-white shadow-lg">
                <div className="flex items-center justify-between border-b p-3">
                <h4 className="font-semibold">{title}</h4>
                <button onClick={onClose} className="text-gray-500 hover:text-black">✕</button>
                </div>
                <div className="p-4">{children}</div>
            </div>
            </div>
        );
}

