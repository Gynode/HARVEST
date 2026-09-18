import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Vote, 
  ThumbsUp, 
  ThumbsDown, 
  Minus, 
  Clock, 
  Users, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const Voting = () => {
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [userVote, setUserVote] = useState(null)

  // Mock voting data
  const activeProposals = [
    {
      id: 1,
      title: "Increase Node Handler Rewards by 20%",
      description: "Proposal to increase the reward rate for Node Handlers by 20% to incentivize more participation and improve network security.",
      type: "Parameter Change",
      timeLeft: "2 days 14 hours",
      endDate: "2024-08-30 23:59",
      yesVotes: 15420000,
      noVotes: 8930000,
      abstainVotes: 2100000,
      totalVotes: 26450000,
      quorum: 50000000,
      support: 63.4,
      participation: 52.9,
      votingType: "Simple Majority",
      requiredSupport: 51,
      userVotingPower: 125000,
      hasVoted: false
    },
    {
      id: 2,
      title: "Community Grant Program Launch",
      description: "Establish a community grant program with $2M funding to support ecosystem development and innovation projects.",
      type: "Funding Request",
      timeLeft: "5 days 8 hours",
      endDate: "2024-09-02 23:59",
      yesVotes: 8200000,
      noVotes: 3100000,
      abstainVotes: 1200000,
      totalVotes: 12500000,
      quorum: 50000000,
      support: 72.6,
      participation: 25.0,
      votingType: "Simple Majority",
      requiredSupport: 51,
      userVotingPower: 125000,
      hasVoted: false
    }
  ]

  const votingHistory = [
    { week: 'W1', proposals: 2, participation: 45 },
    { week: 'W2', participation: 52 },
    { week: 'W3', proposals: 1, participation: 38 },
    { week: 'W4', proposals: 3, participation: 61 },
    { week: 'W5', proposals: 2, participation: 53 }
  ]

  const voteDistribution = [
    { name: 'Yes', value: 15420000, color: '#10b981' },
    { name: 'No', value: 8930000, color: '#ef4444' },
    { name: 'Abstain', value: 2100000, color: '#6b7280' }
  ]

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const formatTimeLeft = (timeString) => {
    return timeString
  }

  const handleVote = (proposalId, voteType) => {
    setUserVote({ proposalId, voteType })
    // In a real app, this would submit the vote to the blockchain
    console.log(`Voting ${voteType} on proposal ${proposalId}`)
  }

  const VotingCard = ({ proposal }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {proposal.type}
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  {proposal.votingType}
                </Badge>
              </div>
              <CardTitle className="text-xl leading-tight">{proposal.title}</CardTitle>
              <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
                {proposal.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Voting Progress */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {proposal.support.toFixed(1)}% Support
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  (Required: {proposal.requiredSupport}%)
                </span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{formatTimeLeft(proposal.timeLeft)} left</span>
              </div>
            </div>
            
            <Progress value={proposal.support} className="h-3 mb-3" />
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-green-600 dark:text-green-400">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="font-semibold">{formatNumber(proposal.yesVotes)}</span>
                </div>
                <div className="text-gray-500 dark:text-gray-400">Yes</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-red-600 dark:text-red-400">
                  <ThumbsDown className="w-4 h-4" />
                  <span className="font-semibold">{formatNumber(proposal.noVotes)}</span>
                </div>
                <div className="text-gray-500 dark:text-gray-400">No</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-gray-600 dark:text-gray-400">
                  <Minus className="w-4 h-4" />
                  <span className="font-semibold">{formatNumber(proposal.abstainVotes)}</span>
                </div>
                <div className="text-gray-500 dark:text-gray-400">Abstain</div>
              </div>
            </div>
          </div>

          {/* Quorum Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Quorum Progress
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatNumber(proposal.totalVotes)} / {formatNumber(proposal.quorum)}
              </span>
            </div>
            <Progress value={proposal.participation} className="h-2" />
            <div className="flex items-center justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span>{proposal.participation.toFixed(1)}% participation</span>
              <span>{proposal.participation >= 10 ? 'Quorum met' : 'Quorum needed'}</span>
            </div>
          </div>

          {/* User Voting Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Your Voting Power
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatNumber(proposal.userVotingPower)} HRV
                </p>
              </div>
              {proposal.hasVoted ? (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Voted
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Pending
                </Badge>
              )}
            </div>

            {!proposal.hasVoted && (
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVote(proposal.id, 'yes')}
                  className="border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/20"
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  Yes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVote(proposal.id, 'no')}
                  className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20"
                >
                  <ThumbsDown className="w-4 h-4 mr-1" />
                  No
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVote(proposal.id, 'abstain')}
                  className="border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <Minus className="w-4 h-4 mr-1" />
                  Abstain
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Voting</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Cast your votes on active governance proposals
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Your Voting Power</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">125,000 HRV</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <Vote className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Voting Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Active Proposals</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {activeProposals.length}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Awaiting your vote</p>
                </div>
                <div className="p-3 bg-blue-500 rounded-lg">
                  <Vote className="w-6 h-6 text-white" />
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
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Participation Rate</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {((activeProposals.reduce((sum, p) => sum + p.participation, 0) / activeProposals.length) || 0).toFixed(1)}%
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">Average across proposals</p>
                </div>
                <div className="p-3 bg-green-500 rounded-lg">
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
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Your Participation</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {activeProposals.filter(p => p.hasVoted).length}/{activeProposals.length}
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Proposals voted on</p>
                </div>
                <div className="p-3 bg-purple-500 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Proposals</TabsTrigger>
          <TabsTrigger value="analytics">Voting Analytics</TabsTrigger>
          <TabsTrigger value="history">Participation History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeProposals.map((proposal) => (
              <VotingCard key={proposal.id} proposal={proposal} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vote Distribution */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Vote Distribution</CardTitle>
                  <CardDescription>Current voting breakdown for active proposals</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={voteDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {voteDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [formatNumber(value), 'Votes']}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {voteDistribution.map((item, index) => (
                      <div key={index} className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-1">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatNumber(item.value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Participation Trends */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Participation Trends</CardTitle>
                  <CardDescription>Weekly voting participation rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={votingHistory}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Participation']}
                        labelStyle={{ color: '#374151' }}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar 
                        dataKey="participation" 
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Your Voting History</CardTitle>
                <CardDescription>Track your participation in governance decisions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No voting history yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Start participating in governance by voting on active proposals
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Vote Confirmation Modal */}
      {userVote && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setUserVote(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Vote Submitted Successfully
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your vote "{userVote.voteType}" has been recorded on the blockchain.
              </p>
              <Button 
                onClick={() => setUserVote(null)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Continue
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default Voting

