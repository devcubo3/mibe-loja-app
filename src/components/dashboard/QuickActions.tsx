import Link from 'next/link';
import { Plus, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';

export function QuickActions() {
  return (
    <Link href="/registrar-venda">
      <Card className="card-highlight cursor-pointer hover:shadow-lg transition-shadow">
        <CardContent className="p-lg">
          <div className="flex items-center gap-md">
            <div className="w-14 h-14 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Plus className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-body-lg font-semibold mb-xs flex items-center gap-2">
                Registrar Nova Venda
                <Sparkles className="w-4 h-4 text-warning" />
              </h3>
              <p className="text-body text-text-secondary">
                Adicione uma nova venda e gere cashback
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
