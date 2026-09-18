import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Users, 
  Vote, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'

const Dashboard = () => {
  // Mock data for charts
  const treasuryData = [
    { month: 'Jan', value: 45.2 },
    { month: 'Feb', value: 47.8 },
    { month: 'Mar', value: 49.1 },
    { month: 'Apr', value: 51.3 },
    { month: 'May', value: 52.7 },
    { month: 'Jun', value: 52.7 },
  ]

  const assetAllocation = [
    { name: 'HRV Tokens', value: 30000000, percentage: 56.9, color: '#10b981' },
    { name: 'Stablecoins', value: 15000000, percentage: 28.4, color: '#3b82f6' },
    { name: 'L1 Assets', value: 2500000, percentage: 4.7, color: '#8b5cf6' },
    { name: 'Yield Bearing', value: 5267857, percentage: 10.0, color: '#f59e0b' },
  ]

  const votingActivity = [
    { week: 'W1', proposals: 2, votes: 145 },
    { week: 'W2', proposals: 3, votes: 289 },
    { week: 'W3', proposals: 1, votes: 156 },
    { week: 'W4', proposals: 4, votes: 378 },
  ]

  const recentProposals = [
    {
      id: 1,
      title: "Increase Node Handler Rewards",
      status: "active",
      votes: 1247,
      timeLeft: "2 days",
      support: 67
    },
    {
      id: 2,
      title: "Treasury Diversification Strategy",
      status: "passed",
      votes: 2156,
      timeLeft: "Executed",
      support: 78
    },
    {
      id: 3,
      title: "Governance Parameter Update",
      status: "rejected",
      votes: 892,
      timeLeft: "Ended",
      support: 34
    },
    {
      id: 4,
      title: "Community Grant Program",
      status: "pending",
      votes: 0,
      timeLeft: "5 days",
      support: 0
    }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'passed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of HARVEST DAO governance and treasury
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Last updated: 2 minutes ago</span>
        </div>
      </div>

      {/* Key Metrics */}
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
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Treasury Value</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">$52.7M</p>
                  <div className="flex items-center mt-1">
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400">+5.2%</span>
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
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Active Members</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">1,247</p>
                  <div className="flex items-center mt-1">
                    <ArrowUpRight className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-blue-600 dark:text-blue-400">+12.3%</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-500 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
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
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Active Proposals</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">5</p>
                  <div className="flex items-center mt-1">
                    <ArrowDownRight className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-purple-600 dark:text-purple-400">-2 from last week</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-500 rounded-lg">
                  <Vote className="w-6 h-6 text-white" />
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
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Voting Power</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">89.2%</p>
                  <div className="flex items-center mt-1">
                    <ArrowUpRight className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-orange-600 dark:text-orange-400">+3.1%</span>
                  </div>
                </div>
                <div className="p-3 bg-orange-500 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Treasury Growth */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Treasury Growth</CardTitle>
              <CardDescription>Monthly treasury value in millions USD</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={treasuryData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`$${value}M`, 'Treasury Value']}
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
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Asset Allocation */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
              <CardDescription>Current treasury asset distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
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
                    formatter={(value, name) => [`$${(value / 1000000).toFixed(1)}M`, name]}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {assetAllocation.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.name} ({item.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Proposals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Proposals</CardTitle>
            <CardDescription>Latest governance proposals and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProposals.map((proposal) => (
                <div 
                  key={proposal.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(proposal.status)}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {proposal.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {proposal.votes} votes • {proposal.timeLeft}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {proposal.status === 'active' && (
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {proposal.support}% support
                        </div>
                        <Progress value={proposal.support} className="w-20 h-2" />
                      </div>
                    )}
                    <Badge className={getStatusColor(proposal.status)}>
                      {proposal.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default Dashboard

