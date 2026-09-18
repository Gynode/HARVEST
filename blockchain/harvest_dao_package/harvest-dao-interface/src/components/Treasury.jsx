import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Zap,
  Target,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts'

const Treasury = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('6m')

  // Mock treasury data
  const treasuryOverview = {
    totalValue: 52767857,
    monthlyChange: 5.2,
    operatingExpenses: 50000,
    monthsCovered: 300,
    yieldGenerated: 267857,
    yieldAPY: 6.8
  }

  const assetAllocation = [
    { name: 'HRV Tokens', value: 30000000, percentage: 56.9, color: '#10b981', target: 30 },
    { name: 'Stablecoins', value: 15000000, percentage: 28.4, color: '#3b82f6', target: 40 },
    { name: 'L1 Assets', value: 2500000, percentage: 4.7, color: '#8b5cf6', target: 20 },
    { name: 'Yield Bearing', value: 5267857, percentage: 10.0, color: '#f59e0b', target: 10 }
  ]

  const yieldStrategies = [
    {
      name: 'USDC Compound',
      protocol: 'Compound',
      asset: 'USDC',
      allocated: 2000000,
      apy: 4.5,
      risk: 'Low',
      status: 'Active'
    },
    {
      name: 'ADA Staking',
      protocol: 'Cardano',
      asset: 'ADA',
      allocated: 1000000,
      apy: 5.2,
      risk: 'Low',
      status: 'Active'
    },
    {
      name: 'DAI Yearn',
      protocol: 'Yearn',
      asset: 'DAI',
      allocated: 1500000,
      apy: 6.8,
      risk: 'Medium',
      status: 'Active'
    }
  ]

  const treasuryHistory = [
    { month: 'Jan', value: 45.2, yield: 1.2 },
    { month: 'Feb', value: 47.8, yield: 1.8 },
    { month: 'Mar', value: 49.1, yield: 2.1 },
    { month: 'Apr', value: 51.3, yield: 2.4 },
    { month: 'May', value: 52.7, yield: 2.7 },
    { month: 'Jun', value: 52.7, yield: 2.7 }
  ]

  const recentTransactions = [
    {
      id: 1,
      type: 'Yield Strategy Allocation',
      asset: 'USDC',
      amount: 2000000,
      direction: 'out',
      timestamp: '2024-08-28 14:30',
      status: 'Completed'
    },
    {
      id: 2,
      type: 'Funding Transfer',
      asset: 'HRV',
      amount: 500000,
      direction: 'out',
      timestamp: '2024-08-27 09:15',
      status: 'Completed'
    },
    {
      id: 3,
      type: 'Yield Collection',
      asset: 'ADA',
      amount: 52000,
      direction: 'in',
      timestamp: '2024-08-26 16:45',
      status: 'Completed'
    },
    {
      id: 4,
      type: 'Asset Rebalancing',
      asset: 'DAI',
      amount: 1500000,
      direction: 'out',
      timestamp: '2024-08-25 11:20',
      status: 'Completed'
    }
  ]

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`
    }
    return `$${amount.toLocaleString()}`
  }

  const getRiskColor = (risk) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Treasury</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            DAO treasury management and asset allocation
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Real-time data</span>
        </div>
      </div>

      {/* Treasury Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Value</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {formatCurrency(treasuryOverview.totalValue)}
                  </p>
                  <div className="flex items-center mt-1">
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400">
                      +{treasuryOverview.monthlyChange}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-500 rounded-lg">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Yield Generated</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {formatCurrency(treasuryOverview.yieldGenerated)}
                  </p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      {treasuryOverview.yieldAPY}% APY
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-500 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Operating Expenses</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {formatCurrency(treasuryOverview.operatingExpenses)}
                  </p>
                  <div className="flex items-center mt-1">
                    <Shield className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-purple-600 dark:text-purple-400">
                      {treasuryOverview.monthsCovered} months covered
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-purple-500 rounded-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Diversification</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">Good</p>
                  <div className="flex items-center mt-1">
                    <Target className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-orange-600 dark:text-orange-400">
                      4 asset types
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-orange-500 rounded-lg">
                  <PieChart className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="allocation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
          <TabsTrigger value="yield">Yield Strategies</TabsTrigger>
          <TabsTrigger value="history">Performance</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="allocation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Asset Allocation Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Current Allocation</CardTitle>
                  <CardDescription>Distribution of treasury assets</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={assetAllocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {assetAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [formatCurrency(value), 'Value']}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Allocation vs Target */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Target vs Current</CardTitle>
                  <CardDescription>Asset allocation compared to targets</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assetAllocation.map((asset, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: asset.color }}
                          ></div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {asset.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {asset.percentage}% / {asset.target}%
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatCurrency(asset.value)}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Progress value={asset.percentage} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Current: {asset.percentage}%</span>
                          <span>Target: {asset.target}%</span>
                        </div>
                      </div>
                      {Math.abs(asset.percentage - asset.target) > 5 && (
                        <div className="flex items-center space-x-1 text-xs text-orange-600 dark:text-orange-400">
                          <AlertTriangle className="w-3 h-3" />
                          <span>
                            {asset.percentage > asset.target ? 'Over' : 'Under'} allocated by {Math.abs(asset.percentage - asset.target).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="yield" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {yieldStrategies.map((strategy, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{strategy.name}</CardTitle>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                        {strategy.status}
                      </Badge>
                    </div>
                    <CardDescription>{strategy.protocol}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Allocated</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(strategy.allocated)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Asset</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {strategy.asset}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">APY</p>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                          {strategy.apy}%
                        </p>
                      </div>
                      <Badge className={getRiskColor(strategy.risk)}>
                        {strategy.risk} Risk
                      </Badge>
                    </div>

                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <Zap className="w-4 h-4" />
                        <span>Earning {((strategy.allocated * strategy.apy) / 100 / 12).toFixed(0)} monthly</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Treasury Performance</CardTitle>
                <CardDescription>Historical treasury value and yield generation</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={treasuryHistory}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'value' ? `$${value}M` : `$${value}M`,
                        name === 'value' ? 'Treasury Value' : 'Yield Generated'
                      ]}
                      labelStyle={{ color: '#374151' }}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="yield" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest treasury operations and movements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div 
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${
                          transaction.direction === 'in' 
                            ? 'bg-green-100 dark:bg-green-900/20' 
                            : 'bg-red-100 dark:bg-red-900/20'
                        }`}>
                          {transaction.direction === 'in' ? (
                            <ArrowDownRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {transaction.type}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {transaction.timestamp}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${
                          transaction.direction === 'in' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.direction === 'in' ? '+' : '-'}{formatCurrency(transaction.amount)} {transaction.asset}
                        </div>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Treasury

