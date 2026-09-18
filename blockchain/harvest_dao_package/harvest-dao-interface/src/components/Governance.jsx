import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Users, 
  Shield, 
  Clock, 
  Percent, 
  Vote,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'

const Governance = () => {
  const [editingParameter, setEditingParameter] = useState(null)
  const [parameterValues, setParameterValues] = useState({})

  // Mock governance data
  const governanceParameters = [
    {
      id: 'proposal_threshold',
      name: 'Proposal Threshold',
      description: 'Minimum HRV tokens required to create a proposal',
      currentValue: '1,000,000',
      unit: 'HRV',
      category: 'Proposals',
      lastChanged: '2024-07-15',
      changeRequirement: 'Supermajority (67%)',
      icon: Vote
    },
    {
      id: 'voting_period',
      name: 'Voting Period',
      description: 'Duration for which proposals remain open for voting',
      currentValue: '7',
      unit: 'days',
      category: 'Voting',
      lastChanged: '2024-06-20',
      changeRequirement: 'Supermajority (67%)',
      icon: Clock
    },
    {
      id: 'quorum_threshold',
      name: 'Quorum Threshold',
      description: 'Minimum participation required for proposal validity',
      currentValue: '5',
      unit: '%',
      category: 'Voting',
      lastChanged: '2024-08-01',
      changeRequirement: 'Supermajority (67%)',
      icon: Percent
    },
    {
      id: 'execution_delay',
      name: 'Execution Delay',
      description: 'Timelock period before approved proposals are executed',
      currentValue: '2',
      unit: 'days',
      category: 'Execution',
      lastChanged: '2024-05-10',
      changeRequirement: 'Supermajority (67%)',
      icon: Shield
    },
    {
      id: 'approval_threshold',
      name: 'Approval Threshold',
      description: 'Minimum support required for proposal approval',
      currentValue: '51',
      unit: '%',
      category: 'Voting',
      lastChanged: '2024-04-25',
      changeRequirement: 'Supermajority (67%)',
      icon: CheckCircle
    }
  ]

  const nodeHandlers = [
    {
      id: 1,
      address: '0x1234...5678',
      name: 'Node Handler Alpha',
      status: 'Active',
      joinDate: '2024-01-15',
      proposalsReviewed: 23,
      uptime: 99.8,
      reputation: 'Excellent'
    },
    {
      id: 2,
      address: '0x2345...6789',
      name: 'Node Handler Beta',
      status: 'Active',
      joinDate: '2024-02-20',
      proposalsReviewed: 18,
      uptime: 98.5,
      reputation: 'Good'
    },
    {
      id: 3,
      address: '0x3456...7890',
      name: 'Node Handler Gamma',
      status: 'Active',
      joinDate: '2024-03-10',
      proposalsReviewed: 15,
      uptime: 99.2,
      reputation: 'Good'
    }
  ]

  const treasuryCommittee = [
    {
      id: 1,
      address: '0x4567...8901',
      name: 'Treasury Admin Alpha',
      role: 'Lead Administrator',
      joinDate: '2024-01-10',
      transactionsApproved: 45,
      status: 'Active'
    },
    {
      id: 2,
      address: '0x5678...9012',
      name: 'Treasury Admin Beta',
      role: 'Financial Analyst',
      joinDate: '2024-01-15',
      transactionsApproved: 38,
      status: 'Active'
    },
    {
      id: 3,
      address: '0x6789...0123',
      name: 'Treasury Admin Gamma',
      role: 'Risk Manager',
      joinDate: '2024-02-01',
      transactionsApproved: 32,
      status: 'Active'
    }
  ]

  const recentChanges = [
    {
      id: 1,
      parameter: 'Quorum Threshold',
      oldValue: '3%',
      newValue: '5%',
      proposalId: 'PROP-2024-015',
      date: '2024-08-01',
      status: 'Executed'
    },
    {
      id: 2,
      parameter: 'Voting Period',
      oldValue: '5 days',
      newValue: '7 days',
      proposalId: 'PROP-2024-012',
      date: '2024-06-20',
      status: 'Executed'
    },
    {
      id: 3,
      parameter: 'Execution Delay',
      oldValue: '1 day',
      newValue: '2 days',
      proposalId: 'PROP-2024-008',
      date: '2024-05-10',
      status: 'Executed'
    }
  ]

  const handleEditParameter = (parameterId) => {
    setEditingParameter(parameterId)
    const parameter = governanceParameters.find(p => p.id === parameterId)
    setParameterValues({
      ...parameterValues,
      [parameterId]: parameter.currentValue.replace(/,/g, '')
    })
  }

  const handleSaveParameter = (parameterId) => {
    // In a real app, this would create a governance proposal
    console.log(`Creating proposal to change ${parameterId} to ${parameterValues[parameterId]}`)
    setEditingParameter(null)
  }

  const handleCancelEdit = () => {
    setEditingParameter(null)
    setParameterValues({})
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getReputationColor = (reputation) => {
    switch (reputation.toLowerCase()) {
      case 'excellent':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'good':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'fair':
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Governance</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            DAO parameters, roles, and governance settings
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Shield className="w-4 h-4" />
          <span>Multi-signature protected</span>
        </div>
      </div>

      {/* Governance Overview */}
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
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Node Handlers</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {nodeHandlers.filter(n => n.status === 'Active').length}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Active validators</p>
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
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Treasury Committee</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {treasuryCommittee.filter(t => t.status === 'Active').length}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">Active members</p>
                </div>
                <div className="p-3 bg-green-500 rounded-lg">
                  <Shield className="w-6 h-6 text-white" />
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
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Parameters</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {governanceParameters.length}
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Configurable settings</p>
                </div>
                <div className="p-3 bg-purple-500 rounded-lg">
                  <Settings className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="parameters" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="node-handlers">Node Handlers</TabsTrigger>
          <TabsTrigger value="treasury">Treasury Committee</TabsTrigger>
          <TabsTrigger value="history">Change History</TabsTrigger>
        </TabsList>

        <TabsContent value="parameters" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {governanceParameters.map((parameter, index) => {
              const Icon = parameter.icon
              const isEditing = editingParameter === parameter.id
              
              return (
                <motion.div
                  key={parameter.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{parameter.name}</CardTitle>
                            <Badge variant="outline" className="mt-1">
                              {parameter.category}
                            </Badge>
                          </div>
                        </div>
                        {!isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditParameter(parameter.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <CardDescription>{parameter.description}</CardDescription>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Current Value
                          </span>
                          {isEditing ? (
                            <div className="flex items-center space-x-2">
                              <Input
                                value={parameterValues[parameter.id] || ''}
                                onChange={(e) => setParameterValues({
                                  ...parameterValues,
                                  [parameter.id]: e.target.value
                                })}
                                className="w-24 h-8 text-right"
                                placeholder={parameter.currentValue}
                              />
                              <span className="text-sm text-gray-500">{parameter.unit}</span>
                            </div>
                          ) : (
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {parameter.currentValue} {parameter.unit}
                            </span>
                          )}
                        </div>

                        {isEditing && (
                          <div className="flex items-center space-x-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveParameter(parameter.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="w-3 h-3 mr-1" />
                              Create Proposal
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelEdit}
                            >
                              <X className="w-3 h-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        )}

                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Last Changed</span>
                            <span className="text-gray-700 dark:text-gray-300">{parameter.lastChanged}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Change Requirement</span>
                            <Badge variant="outline" className="text-xs">
                              {parameter.changeRequirement}
                            </Badge>
                          </div>
                        </div>

                        {isEditing && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                            <div className="flex items-start space-x-2">
                              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                              <div className="text-sm text-blue-700 dark:text-blue-300">
                                <p className="font-medium mb-1">Creating a Parameter Change Proposal</p>
                                <p>This will create a governance proposal that requires {parameter.changeRequirement} to pass. The change will be executed after a 2-day timelock period.</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="node-handlers" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Node Handlers</CardTitle>
                <CardDescription>Authorized validators for the HARVEST PoA network</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {nodeHandlers.map((handler) => (
                    <div 
                      key={handler.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{handler.name.charAt(0)}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {handler.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {handler.address}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {handler.uptime}% uptime
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {handler.proposalsReviewed} reviews
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <Badge className={getStatusColor(handler.status)}>
                            {handler.status}
                          </Badge>
                          <Badge className={getReputationColor(handler.reputation)}>
                            {handler.reputation}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="treasury" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Treasury Committee</CardTitle>
                <CardDescription>Multi-signature treasury management team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {treasuryCommittee.map((member) => (
                    <div 
                      key={member.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{member.name.charAt(0)}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {member.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {member.address}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {member.role}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {member.transactionsApproved} approvals
                          </div>
                        </div>
                        <Badge className={getStatusColor(member.status)}>
                          {member.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Parameter Change History</CardTitle>
                <CardDescription>Recent governance parameter modifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentChanges.map((change) => (
                    <div 
                      key={change.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {change.parameter}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {change.oldValue} → {change.newValue}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {change.proposalId}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {change.date}
                        </div>
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

export default Governance

