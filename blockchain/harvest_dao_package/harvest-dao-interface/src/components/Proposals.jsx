import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Users,
  Calendar,
  ArrowRight,
  Eye,
  MessageSquare,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const Proposals = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedProposal, setSelectedProposal] = useState(null)

  const proposals = [
    {
      id: 1,
      title: "Increase Node Handler Rewards by 20%",
      description: "Proposal to increase the reward rate for Node Handlers by 20% to incentivize more participation and improve network security.",
      type: "parameter_change",
      status: "active",
      proposer: "Alice_Validator",
      created: "2024-08-25",
      votingEnd: "2024-08-30",
      yesVotes: 15420000,
      noVotes: 8930000,
      abstainVotes: 2100000,
      totalVotes: 26450000,
      quorum: 50000000,
      support: 63.4,
      comments: 23,
      views: 1247
    },
    {
      id: 2,
      title: "Treasury Diversification Strategy",
      description: "Implement a comprehensive treasury diversification strategy to reduce risk and improve yield generation through DeFi protocols.",
      type: "treasury_management",
      status: "passed",
      proposer: "Treasury_Committee",
      created: "2024-08-20",
      votingEnd: "2024-08-25",
      yesVotes: 45600000,
      noVotes: 12800000,
      abstainVotes: 3200000,
      totalVotes: 61600000,
      quorum: 50000000,
      support: 78.2,
      comments: 45,
      views: 2156
    },
    {
      id: 3,
      title: "Governance Parameter Update",
      description: "Update governance parameters to reduce proposal threshold and increase voting period for better community participation.",
      type: "governance_change",
      status: "rejected",
      proposer: "Community_Member_42",
      created: "2024-08-18",
      votingEnd: "2024-08-23",
      yesVotes: 18200000,
      noVotes: 35400000,
      abstainVotes: 4100000,
      totalVotes: 57700000,
      quorum: 50000000,
      support: 34.0,
      comments: 67,
      views: 892
    },
    {
      id: 4,
      title: "Community Grant Program Launch",
      description: "Establish a community grant program with $2M funding to support ecosystem development and innovation projects.",
      type: "funding_request",
      status: "pending",
      proposer: "Dev_Team_Lead",
      created: "2024-08-28",
      votingEnd: "2024-09-02",
      yesVotes: 0,
      noVotes: 0,
      abstainVotes: 0,
      totalVotes: 0,
      quorum: 50000000,
      support: 0,
      comments: 8,
      views: 234
    },
    {
      id: 5,
      title: "Implement Quadratic Voting",
      description: "Introduce quadratic voting mechanism for parameter changes to reduce whale influence and improve democratic participation.",
      type: "governance_change",
      status: "under_review",
      proposer: "Governance_Researcher",
      created: "2024-08-27",
      votingEnd: "2024-09-01",
      yesVotes: 0,
      noVotes: 0,
      abstainVotes: 0,
      totalVotes: 0,
      quorum: 50000000,
      support: 0,
      comments: 15,
      views: 567
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
      case 'under_review':
        return <Eye className="w-4 h-4 text-purple-500" />
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
      case 'under_review':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'parameter_change':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
      case 'treasury_management':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'governance_change':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
      case 'funding_request':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || proposal.status === selectedFilter
    return matchesSearch && matchesFilter
  })

  const ProposalCard = ({ proposal }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedProposal(proposal)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {getStatusIcon(proposal.status)}
                <Badge className={getStatusColor(proposal.status)}>
                  {proposal.status.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className={getTypeColor(proposal.type)}>
                  {proposal.type.replace('_', ' ')}
                </Badge>
              </div>
              <CardTitle className="text-lg leading-tight">{proposal.title}</CardTitle>
              <CardDescription className="mt-2 line-clamp-2">
                {proposal.description}
              </CardDescription>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Voting Progress */}
            {proposal.status === 'active' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Support: {proposal.support}%
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatNumber(proposal.totalVotes)} / {formatNumber(proposal.quorum)} votes
                  </span>
                </div>
                <Progress value={proposal.support} className="h-2" />
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <ThumbsUp className="w-3 h-3 text-green-500" />
                      <span>{formatNumber(proposal.yesVotes)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ThumbsDown className="w-3 h-3 text-red-500" />
                      <span>{formatNumber(proposal.noVotes)}</span>
                    </div>
                  </div>
                  <span>Ends {proposal.votingEnd}</span>
                </div>
              </div>
            )}

            {/* Proposal Meta */}
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{proposal.proposer}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{proposal.created}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{proposal.views}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{proposal.comments}</span>
                </div>
              </div>
            </div>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Proposals</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Governance proposals and community voting
          </p>
        </div>
        <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          New Proposal
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search proposals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={selectedFilter} onValueChange={setSelectedFilter} className="w-auto">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="under_review">Review</TabsTrigger>
            <TabsTrigger value="passed">Passed</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Proposals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProposals.map((proposal) => (
          <ProposalCard key={proposal.id} proposal={proposal} />
        ))}
      </div>

      {/* Empty State */}
      {filteredProposals.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No proposals found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search terms or filters
          </p>
        </motion.div>
      )}

      {/* Proposal Detail Modal */}
      {selectedProposal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedProposal(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(selectedProposal.status)}
                    <Badge className={getStatusColor(selectedProposal.status)}>
                      {selectedProposal.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline" className={getTypeColor(selectedProposal.type)}>
                      {selectedProposal.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedProposal.title}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProposal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {selectedProposal.description}
                  </p>
                </div>

                {selectedProposal.status === 'active' && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Voting Results</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Support: {selectedProposal.support}%</span>
                        <span className="text-sm text-gray-500">
                          {formatNumber(selectedProposal.totalVotes)} / {formatNumber(selectedProposal.quorum)} votes
                        </span>
                      </div>
                      <Progress value={selectedProposal.support} className="h-3" />
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-green-600 font-semibold">
                            {formatNumber(selectedProposal.yesVotes)}
                          </div>
                          <div className="text-gray-500">Yes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-red-600 font-semibold">
                            {formatNumber(selectedProposal.noVotes)}
                          </div>
                          <div className="text-gray-500">No</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600 font-semibold">
                            {formatNumber(selectedProposal.abstainVotes)}
                          </div>
                          <div className="text-gray-500">Abstain</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Proposed by {selectedProposal.proposer} on {selectedProposal.created}
                  </div>
                  {selectedProposal.status === 'active' && (
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <ThumbsDown className="w-4 h-4 mr-1" />
                        Vote No
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Vote Yes
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default Proposals

