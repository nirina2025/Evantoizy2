import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { DashboardStats, Transaction } from '../types';
import { TrendingUp, Package, DollarSign, Users, Calendar, BarChart3, Monitor, Image, Video } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  userRole: 'admin' | 'vendor';
}

export const Dashboard: React.FC<DashboardProps> = ({ userRole }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCodes: 0,
    availableCodes: 0,
    soldCodes: 0,
    totalRevenue: 0,
    totalProfit: 0,
    todaysSales: 0,
    monthlyRevenue: 0
  });
  const [platformStats, setPlatformStats] = useState<{[key: string]: any}>({});
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!db || !auth.currentUser) return;

    try {
      // Charger les statistiques des codes
      const codesQuery = query(collection(db, 'rechargeCodes'));
      const codesSnapshot = await getDocs(codesQuery);
      const codes = codesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        purchaseDate: doc.data().purchaseDate?.toDate() || new Date(),
        saleDate: doc.data().saleDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      }));

      const totalCodes = codes.length;
      const availableCodes = codes.filter(code => code.status === 'available').length;
      const soldCodes = codes.filter(code => code.status === 'sold').length;

      // Charger les transactions
      const transactionsQuery = query(
        collection(db, 'transactions'),
        orderBy('createdAt', 'desc')
      );
      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactions = transactionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        saleDate: doc.data().saleDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Transaction[];

      setRecentTransactions(transactions.slice(0, 10));

      const totalRevenue = transactions.reduce((sum, t) => sum + t.salePrice, 0);
      const totalProfit = transactions.reduce((sum, t) => sum + t.profit, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaysSales = transactions.filter(t => t.saleDate >= today).length;

      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthlyRevenue = transactions
        .filter(t => t.saleDate >= firstDayOfMonth)
        .reduce((sum, t) => sum + t.salePrice, 0);

      // Calculer les statistiques par plateforme
      const platforms = ['Envato', 'Motionarray', 'Freepik'];
      const platformData: {[key: string]: any} = {};
      
      platforms.forEach(platform => {
        const platformCodes = codes.filter(code => code.platform === platform);
        const platformTransactions = transactions.filter(t => t.platform === platform);
        
        platformData[platform] = {
          totalCodes: platformCodes.length,
          availableCodes: platformCodes.filter(code => code.status === 'available').length,
          soldCodes: platformCodes.filter(code => code.status === 'sold').length,
          totalRevenue: platformTransactions.reduce((sum, t) => sum + t.salePrice, 0),
          totalProfit: platformTransactions.reduce((sum, t) => sum + t.profit, 0),
          monthlyRevenue: platformTransactions
            .filter(t => t.saleDate >= firstDayOfMonth)
            .reduce((sum, t) => sum + t.salePrice, 0)
        };
      });
      
      setPlatformStats(platformData);

      setStats({
        totalCodes,
        availableCodes,
        soldCodes,
        totalRevenue,
        totalProfit,
        todaysSales,
        monthlyRevenue
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Disponibles', value: stats.availableCodes, color: '#10B981' },
    { name: 'Vendus', value: stats.soldCodes, color: '#3B82F6' },
    { name: 'Expirés', value: stats.totalCodes - stats.availableCodes - stats.soldCodes, color: '#EF4444' }
  ];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Envato': return Monitor;
      case 'Freepik': return Image;
      case 'Motionarray': return Video;
      default: return Package;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Envato': return 'from-green-500 to-emerald-600';
      case 'Freepik': return 'from-blue-500 to-cyan-600';
      case 'Motionarray': return 'from-purple-500 to-violet-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-1">Vue d'ensemble de votre activité</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{new Date().toLocaleDateString('fr-FR')}</span>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Codes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCodes}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Codes Disponibles</p>
              <p className="text-2xl font-bold text-green-600">{stats.availableCodes}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalRevenue.toLocaleString()} Ar</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bénéfices</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalProfit.toLocaleString()} Ar</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques par plateforme */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Statistiques par plateforme</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Object.entries(platformStats).map(([platform, data]) => {
            const Icon = getPlatformIcon(platform);
            const colorClass = getPlatformColor(platform);
            
            return (
              <div key={platform} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className={`bg-gradient-to-r ${colorClass} p-4`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{platform}</h3>
                      <p className="text-white/80 text-sm">Plateforme créative</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{data.totalCodes}</p>
                      <p className="text-sm text-gray-600">Total codes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{data.availableCodes}</p>
                      <p className="text-sm text-gray-600">Disponibles</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Chiffre d'affaires</span>
                      <span className="font-semibold text-blue-600">{data.totalRevenue.toLocaleString()} Ar</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Bénéfices</span>
                      <span className="font-semibold text-purple-600">{data.totalProfit.toLocaleString()} Ar</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Ce mois</span>
                      <span className="font-semibold text-green-600">{data.monthlyRevenue.toLocaleString()} Ar</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des codes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-4 mt-4">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transactions récentes</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{transaction.platform}</p>
                  <p className="text-sm text-gray-600">{transaction.denomination.toLocaleString()} Ar - {transaction.type === '1-month' ? '1 mois' : '3 mois'}</p>
                  <p className="text-xs text-gray-500">{transaction.saleDate.toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">+{transaction.salePrice.toLocaleString()} Ar</p>
                  <p className="text-xs text-gray-500">Bénéfice: {transaction.profit.toLocaleString()} Ar</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};