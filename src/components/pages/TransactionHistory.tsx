import React from 'react';
import { History, CreditCard, ArrowUpRight, ArrowDownLeft, Calendar } from 'lucide-react';
import { User, getUserTransactions, formatCreditsDisplay } from '../../utils/userStorage';
import Card, { CardHeader, CardContent } from '../ui/Card';

interface TransactionHistoryProps {
  user: User;
}

export default function TransactionHistory({ user }: TransactionHistoryProps) {
  const transactions = getUserTransactions(user.email);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <ArrowUpRight className="w-4 h-4 text-green-500" />;
      case 'usage':
        return <ArrowDownLeft className="w-4 h-4 text-red-500" />;
      case 'refund':
        return <ArrowUpRight className="w-4 h-4 text-blue-500" />;
      default:
        return <CreditCard className="w-4 h-4 text-slate-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'text-green-400';
      case 'usage':
        return 'text-red-400';
      case 'refund':
        return 'text-blue-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Total Spent</p>
                <p className="text-2xl font-bold text-white">
                  ${transactions.filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Credits Purchased</p>
                <p className="text-2xl font-bold text-white">
                  {formatCreditsDisplay(transactions.filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.credits, 0))}
                </p>
              </div>
              <ArrowUpRight className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Credits Used</p>
                <p className="text-2xl font-bold text-white">
                  {formatCreditsDisplay(Math.abs(transactions.filter(t => t.type === 'usage').reduce((sum, t) => sum + t.credits, 0)))}
                </p>
              </div>
              <ArrowDownLeft className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-white">Transaction History</h2>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No transactions yet.</p>
              <p className="text-sm mt-2">Your purchase and usage history will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.reverse().map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-slate-600/50 rounded-full flex items-center justify-center">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{transaction.packageName}</p>
                      <p className="text-sm text-slate-400">{transaction.description}</p>
                      <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(transaction.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {transaction.amount > 0 && (
                      <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                        ${transaction.amount.toFixed(2)}
                      </p>
                    )}
                    {transaction.credits !== 0 && (
                      <p className={`text-sm ${transaction.credits > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {transaction.credits > 0 ? '+' : ''}{formatCreditsDisplay(Math.abs(transaction.credits))}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}