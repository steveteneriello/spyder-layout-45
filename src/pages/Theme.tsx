import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Sun, Moon, Palette, TrendingUp, Users, DollarSign, ShoppingCart, Activity, AlertCircle, CheckCircle, Clock, Star, Mail, Phone, MapPin, Calendar, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Download, Upload, Plus, Minus, Settings, Home, User, Bell, Heart, Share2, MessageSquare, ThumbsUp, PlayCircle, PauseCircle, RotateCcw, ArrowRight, Timer, Target, Flag } from 'lucide-react';

// Sample data for charts
const chartData = [
  { month: 'Jan', desktop: 186, mobile: 80, revenue: 4000, users: 240 },
  { month: 'Feb', desktop: 305, mobile: 200, revenue: 3000, users: 139 },
  { month: 'Mar', desktop: 237, mobile: 120, revenue: 2000, users: 980 },
  { month: 'Apr', desktop: 73, mobile: 190, revenue: 2780, users: 390 },
  { month: 'May', desktop: 209, mobile: 130, revenue: 1890, users: 480 },
  { month: 'Jun', desktop: 214, mobile: 140, revenue: 2390, users: 380 },
];

const pieData = [
  { name: 'Desktop', value: 400, color: '#3b82f6' },
  { name: 'Mobile', value: 300, color: '#06b6d4' },
  { name: 'Tablet', value: 200, color: '#8b5cf6' },
  { name: 'Other', value: 100, color: '#f59e0b' },
];

const chartConfig = {
  desktop: { label: 'Desktop', color: '#3b82f6' },
  mobile: { label: 'Mobile', color: '#06b6d4' },
  revenue: { label: 'Revenue', color: '#3b82f6' },
  users: { label: 'Users', color: '#06b6d4' },
};

const tableData = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'Active', role: 'Admin', lastSeen: '2 hours ago' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive', role: 'User', lastSeen: '1 day ago' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'Active', role: 'Editor', lastSeen: '5 minutes ago' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', status: 'Pending', role: 'User', lastSeen: 'Never' },
];

const taskData = [
  { id: '1', title: 'Design new landing page', description: 'Create wireframes and mockups for the new homepage', priority: 'High', status: 'In Progress', assignee: 'John Doe', dueDate: '2024-01-20', progress: 75 },
  { id: '2', title: 'Implement user authentication', description: 'Add login and registration functionality', priority: 'Critical', status: 'Todo', assignee: 'Jane Smith', dueDate: '2024-01-18', progress: 0 },
  { id: '3', title: 'Fix mobile responsive issues', description: 'Ensure all pages work correctly on mobile devices', priority: 'Medium', status: 'Review', assignee: 'Bob Johnson', dueDate: '2024-01-22', progress: 90 },
  { id: '4', title: 'Update documentation', description: 'Add API documentation and user guides', priority: 'Low', status: 'Done', assignee: 'Alice Brown', dueDate: '2024-01-15', progress: 100 },
  { id: '5', title: 'Performance optimization', description: 'Improve page load times and reduce bundle size', priority: 'High', status: 'In Progress', assignee: 'John Doe', dueDate: '2024-01-25', progress: 45 },
];

const ComponentId = ({ id }: { id: string }) => (
  <div className="absolute top-1 right-1 bg-blue-500/20 text-blue-400 text-xs px-1 py-0.5 rounded text-[10px] font-mono border border-blue-500/30">
    {id}
  </div>
);

export default function Theme() {
  const [accentColor, setAccentColor] = useState('blue');

  const accentColors = {
    blue: { 
      primary: '221 83% 53%', 
      secondary: '210 40% 96%',
      accent: '210 40% 96%'
    },
    grey: { 
      primary: '220 9% 46%', 
      secondary: '220 9% 94%',
      accent: '220 9% 94%'
    },
    black: { 
      primary: '0 0% 9%', 
      secondary: '0 0% 96%',
      accent: '0 0% 96%'
    },
  };

  const applyAccent = (color: string) => {
    console.log('Applying accent color:', color);
    setAccentColor(color);
    const root = document.documentElement;
    const colors = accentColors[color as keyof typeof accentColors];
    
    if (colors) {
      root.style.setProperty('--primary', colors.primary);
      root.style.setProperty('--secondary', colors.secondary);
      root.style.setProperty('--accent', colors.accent);
      console.log('Applied colors:', colors);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'In Progress': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'Review': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'Todo': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      default: return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Design System Showcase</h1>
            <p className="text-muted-foreground mt-2">
              Explore all available components with blue accents in dark mode
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>

        {/* Accent Colors */}
        <Card className="relative">
          <ComponentId id="AC-001" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-blue-500" />
              Accent Colors
            </CardTitle>
            <CardDescription>Choose your preferred accent color - Current: {accentColor}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {Object.keys(accentColors).map((color) => (
                <Button
                  key={color}
                  variant={accentColor === color ? 'default' : 'outline'}
                  onClick={() => applyAccent(color)}
                  className="capitalize"
                >
                  {color}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Components Showcase */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="tables">Tables</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="misc">Misc</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* KPI Cards Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="relative border-blue-500/20">
                <ComponentId id="KPI-001" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">$45,231.89</div>
                  <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
              </Card>

              <Card className="relative border-blue-500/20">
                <ComponentId id="KPI-002" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">+2,350</div>
                  <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                </CardContent>
              </Card>

              <Card className="relative border-blue-500/20">
                <ComponentId id="KPI-003" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sales</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">+12,234</div>
                  <p className="text-xs text-muted-foreground">+19% from last month</p>
                </CardContent>
              </Card>

              <Card className="relative border-blue-500/20">
                <ComponentId id="KPI-004" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                  <Activity className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">+573</div>
                  <p className="text-xs text-muted-foreground">+201 since last hour</p>
                </CardContent>
              </Card>
            </div>

            {/* Dashboard Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="relative border-blue-500/20">
                <ComponentId id="DASH-001" />
                <CardHeader>
                  <CardTitle className="text-blue-400">Revenue Overview</CardTitle>
                  <CardDescription>Monthly revenue trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area dataKey="revenue" fill="#3b82f6" stroke="#3b82f6" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="relative border-blue-500/20">
                <ComponentId id="DASH-002" />
                <CardHeader>
                  <CardTitle className="text-blue-400">User Activity</CardTitle>
                  <CardDescription>Device usage breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="relative border-blue-500/20">
              <ComponentId id="DASH-003" />
              <CardHeader>
                <CardTitle className="text-blue-400">Recent Activity</CardTitle>
                <CardDescription>Latest user actions and system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { icon: CheckCircle, text: "User John Doe completed onboarding", time: "2 minutes ago", status: "success" },
                    { icon: AlertCircle, text: "Server maintenance scheduled", time: "1 hour ago", status: "warning" },
                    { icon: Users, text: "5 new users registered", time: "3 hours ago", status: "info" },
                    { icon: DollarSign, text: "Payment of $299 received", time: "5 hours ago", status: "success" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <item.icon className={`h-4 w-4 ${
                        item.status === 'success' ? 'text-green-400' :
                        item.status === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm">{item.text}</p>
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            {/* Task Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="relative border-blue-500/20">
                <ComponentId id="TASK-001" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                  <Target className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">24</div>
                  <p className="text-xs text-muted-foreground">+3 this week</p>
                </CardContent>
              </Card>

              <Card className="relative border-blue-500/20">
                <ComponentId id="TASK-002" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <PlayCircle className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">8</div>
                  <p className="text-xs text-muted-foreground">33% of total</p>
                </CardContent>
              </Card>

              <Card className="relative border-blue-500/20">
                <ComponentId id="TASK-003" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">12</div>
                  <p className="text-xs text-muted-foreground">50% completion rate</p>
                </CardContent>
              </Card>

              <Card className="relative border-blue-500/20">
                <ComponentId id="TASK-004" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-400">2</div>
                  <p className="text-xs text-muted-foreground">Need attention</p>
                </CardContent>
              </Card>
            </div>

            {/* Task Board */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {['Todo', 'In Progress', 'Review', 'Done'].map((status) => (
                <Card key={status} className="relative border-blue-500/20">
                  <ComponentId id={`BOARD-${status.replace(' ', '').toUpperCase()}`} />
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-blue-400">{status}</CardTitle>
                    <CardDescription>
                      {taskData.filter(task => task.status === status).length} tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {taskData.filter(task => task.status === status).map((task) => (
                      <div key={task.id} className="p-3 bg-muted/50 rounded-lg border border-blue-500/20">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-medium">{task.title}</h4>
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{task.assignee}</span>
                          <Badge variant="outline" className={getStatusColor(task.status)}>
                            {task.priority}
                          </Badge>
                        </div>
                        {task.progress > 0 && (
                          <div className="mt-2">
                            <Progress value={task.progress} className="h-1" />
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Task Details Table */}
            <Card className="relative border-blue-500/20">
              <ComponentId id="TASK-TABLE" />
              <CardHeader>
                <CardTitle className="text-blue-400">Task Management</CardTitle>
                <CardDescription>Detailed view of all tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Assignee</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taskData.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{task.title}</div>
                            <div className="text-sm text-muted-foreground">{task.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>{task.assignee}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${getPriorityColor(task.priority)} text-white`}>
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="w-16">
                            <Progress value={task.progress} className="h-2" />
                            <span className="text-xs text-muted-foreground">{task.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{task.dueDate}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                              <PlayCircle className="h-3 w-3 text-blue-500" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                              <Edit className="h-3 w-3 text-blue-500" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                              <Eye className="h-3 w-3 text-blue-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cards" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="relative">
                <ComponentId id="C-001" />
                <CardHeader>
                  <CardTitle>Analytics Overview</CardTitle>
                  <CardDescription>Your performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">12,543</div>
                  <p className="text-muted-foreground">Total visits this month</p>
                  <Progress value={75} className="mt-4" />
                </CardContent>
              </Card>

              <Card className="relative">
                <ComponentId id="C-002" />
                <CardHeader>
                  <CardTitle>Revenue</CardTitle>
                  <CardDescription>Monthly earnings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">$24,500</div>
                  <p className="text-muted-foreground">+12% from last month</p>
                  <div className="flex gap-2 mt-4">
                    <Badge variant="secondary">Revenue</Badge>
                    <Badge variant="outline">Growing</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative">
                <ComponentId id="C-003" />
                <CardHeader>
                  <CardTitle>Team Activity</CardTitle>
                  <CardDescription>Recent updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Project Alpha</span>
                      <Badge>Active</Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span>Website Redesign</span>
                      <Badge variant="secondary">In Progress</Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span>Mobile App</span>
                      <Badge variant="outline">Planning</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative">
                <ComponentId id="C-004" />
                <CardHeader>
                  <CardTitle>User Profile</CardTitle>
                  <CardDescription>Account information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">John Doe</h3>
                      <p className="text-sm text-muted-foreground">john@example.com</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Profile completion</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} />
                  </div>
                </CardContent>
              </Card>

              <Card className="relative">
                <ComponentId id="C-005" />
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Recent alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { icon: Mail, text: "New message received", time: "5m ago" },
                      { icon: Bell, text: "Reminder: Meeting at 3 PM", time: "1h ago" },
                      { icon: Heart, text: "Your post got 15 likes", time: "2h ago" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm">{item.text}</p>
                          <p className="text-xs text-muted-foreground">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="relative">
                <ComponentId id="C-006" />
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">142</div>
                      <p className="text-xs text-muted-foreground">Active Users</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">98%</div>
                      <p className="text-xs text-muted-foreground">Uptime</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">24</div>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">5.2s</div>
                      <p className="text-xs text-muted-foreground">Avg Response</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tables" className="space-y-6">
            <Card className="relative">
              <ComponentId id="T-001" />
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage your team members</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Seen</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'Active' ? 'default' : user.status === 'Pending' ? 'secondary' : 'outline'}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.lastSeen}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="relative">
              <ComponentId id="T-002" />
              <CardHeader>
                <CardTitle>Sales Report</CardTitle>
                <CardDescription>Recent sales transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { id: '#ORD-001', customer: 'Alice Johnson', product: 'Premium Plan', amount: '$99.00', date: '2024-01-15', status: 'Completed' },
                      { id: '#ORD-002', customer: 'Bob Smith', product: 'Basic Plan', amount: '$29.00', date: '2024-01-14', status: 'Pending' },
                      { id: '#ORD-003', customer: 'Carol Davis', product: 'Pro Plan', amount: '$59.00', date: '2024-01-13', status: 'Completed' },
                      { id: '#ORD-004', customer: 'David Wilson', product: 'Enterprise', amount: '$299.00', date: '2024-01-12', status: 'Failed' },
                    ].map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.product}</TableCell>
                        <TableCell className="font-semibold">{order.amount}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          <Badge variant={
                            order.status === 'Completed' ? 'default' :
                            order.status === 'Pending' ? 'secondary' : 'destructive'
                          }>
                            {order.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="relative">
                <ComponentId id="CH-001" />
                <CardHeader>
                  <CardTitle>Monthly Statistics</CardTitle>
                  <CardDescription>Desktop vs Mobile usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="desktop" fill="var(--color-desktop)" />
                        <Bar dataKey="mobile" fill="var(--color-mobile)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="relative">
                <ComponentId id="CH-002" />
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={3} dot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="relative">
                <ComponentId id="CH-003" />
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>New users per month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area dataKey="users" fill="var(--color-users)" stroke="var(--color-users)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="relative">
                <ComponentId id="CH-004" />
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                  <CardDescription>Website traffic breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Organic Search', value: 45, color: '#0088FE' },
                            { name: 'Direct', value: 30, color: '#00C49F' },
                            { name: 'Social Media', value: 15, color: '#FFBB28' },
                            { name: 'Referral', value: 10, color: '#FF8042' },
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="forms" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="relative">
                <ComponentId id="F-001" />
                <CardHeader>
                  <CardTitle>User Information</CardTitle>
                  <CardDescription>Update your profile details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Enter your name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Enter your email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="Enter your phone" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="notifications" />
                    <Label htmlFor="notifications">Enable notifications</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button>Save Changes</Button>
                    <Button variant="outline">Cancel</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative">
                <ComponentId id="F-002" />
                <CardHeader>
                  <CardTitle>Contact Form</CardTitle>
                  <CardDescription>Get in touch with us</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help?" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <textarea 
                      id="message" 
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Your message..."
                    />
                  </div>
                  <Button className="w-full">Send Message</Button>
                </CardContent>
              </Card>

              <Card className="relative">
                <ComponentId id="F-003" />
                <CardHeader>
                  <CardTitle>Button Variants</CardTitle>
                  <CardDescription>All available button styles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="link">Link</Button>
                  </div>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-3 gap-2">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex gap-2">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="secondary">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative">
                <ComponentId id="F-004" />
                <CardHeader>
                  <CardTitle>Search & Filters</CardTitle>
                  <CardDescription>Search and filter components</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search..." className="pl-10" />
                    </div>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Category: All</Badge>
                    <Badge variant="outline">Status: Active</Badge>
                    <Badge variant="outline">Date: This Month</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Clear Filters</Button>
                    <Button size="sm">Apply</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="misc" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="relative">
                <ComponentId id="M-001" />
                <CardHeader>
                  <CardTitle>Badge Examples</CardTitle>
                  <CardDescription>Various badge styles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge>Default</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="outline">Outline</Badge>
                      <Badge variant="destructive">Destructive</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-green-500">Success</Badge>
                      <Badge className="bg-yellow-500">Warning</Badge>
                      <Badge className="bg-blue-500">Info</Badge>
                      <Badge className="bg-purple-500">Premium</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative">
                <ComponentId id="M-002" />
                <CardHeader>
                  <CardTitle>Progress Indicators</CardTitle>
                  <CardDescription>Progress bars and completion</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Upload Progress</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Task Completion</span>
                      <span>45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Storage Used</span>
                      <span>90%</span>
                    </div>
                    <Progress value={90} className="h-3" />
                  </div>
                </CardContent>
              </Card>

              <Card className="relative">
                <ComponentId id="M-003" />
                <CardHeader>
                  <CardTitle>Social Actions</CardTitle>
                  <CardDescription>Like, share, and comment buttons</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Heart className="h-4 w-4 mr-2" />
                        Like (24)
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Comment (8)
                      </Button>
                      <Button variant="outline" size="sm">
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Upvote (15)
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative">
                <ComponentId id="M-004" />
                <CardHeader>
                  <CardTitle>Icon Grid</CardTitle>
                  <CardDescription>Common icons used in dashboards</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-6 gap-4">
                    {[Home, User, Settings, Bell, Mail, Search, Calendar, Download, Upload, Edit, Trash2, Eye, Plus, Minus, Filter, MoreHorizontal].map((Icon, index) => (
                      <div key={index} className="flex flex-col items-center p-2 rounded border">
                        <Icon className="h-5 w-5 mb-1" />
                        <span className="text-xs text-muted-foreground">{Icon.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="relative">
                <ComponentId id="M-005" />
                <CardHeader>
                  <CardTitle>Status Indicators</CardTitle>
                  <CardDescription>System status and health</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: "API Status", status: "Operational", color: "green" },
                      { label: "Database", status: "Healthy", color: "green" },
                      { label: "CDN", status: "Degraded", color: "yellow" },
                      { label: "Payment Gateway", status: "Down", color: "red" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full bg-${item.color}-500`} />
                          <span className="text-sm">{item.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="relative">
                <ComponentId id="M-006" />
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common dashboard actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      New Post
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Invite User
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
