
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
import { Sun, Moon, Palette, TrendingUp, Users, DollarSign, ShoppingCart, Activity, AlertCircle, CheckCircle, Clock, Star, Mail, Phone, MapPin, Calendar, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Download, Upload, Plus, Minus, Settings, Home, User, Bell, Heart, Share2, MessageSquare, ThumbsUp } from 'lucide-react';

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
  { name: 'Desktop', value: 400, color: '#0088FE' },
  { name: 'Mobile', value: 300, color: '#00C49F' },
  { name: 'Tablet', value: 200, color: '#FFBB28' },
  { name: 'Other', value: 100, color: '#FF8042' },
];

const chartConfig = {
  desktop: { label: 'Desktop', color: 'hsl(var(--primary))' },
  mobile: { label: 'Mobile', color: 'hsl(var(--secondary))' },
  revenue: { label: 'Revenue', color: 'hsl(var(--primary))' },
  users: { label: 'Users', color: 'hsl(var(--secondary))' },
};

const tableData = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'Active', role: 'Admin', lastSeen: '2 hours ago' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive', role: 'User', lastSeen: '1 day ago' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'Active', role: 'Editor', lastSeen: '5 minutes ago' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', status: 'Pending', role: 'User', lastSeen: 'Never' },
];

const ComponentId = ({ id }: { id: string }) => (
  <div className="absolute top-1 right-1 bg-muted text-muted-foreground text-xs px-1 py-0.5 rounded text-[10px] font-mono">
    {id}
  </div>
);

export default function Theme() {
  const [isDark, setIsDark] = useState(false);
  const [accentColor, setAccentColor] = useState('blue');

  const handleThemeToggle = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

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

  return (
    <div className={`min-h-screen bg-background text-foreground ${isDark ? 'dark' : ''}`}>
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Design System Showcase</h1>
            <p className="text-muted-foreground mt-2">
              Explore all available components and styling options
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              <Switch checked={isDark} onCheckedChange={handleThemeToggle} />
              <Moon className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Accent Colors */}
        <Card className="relative">
          <ComponentId id="AC-001" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="tables">Tables</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="misc">Misc</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* KPI Cards Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="relative">
                <ComponentId id="KPI-001" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$45,231.89</div>
                  <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
              </Card>

              <Card className="relative">
                <ComponentId id="KPI-002" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+2,350</div>
                  <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                </CardContent>
              </Card>

              <Card className="relative">
                <ComponentId id="KPI-003" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sales</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+12,234</div>
                  <p className="text-xs text-muted-foreground">+19% from last month</p>
                </CardContent>
              </Card>

              <Card className="relative">
                <ComponentId id="KPI-004" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+573</div>
                  <p className="text-xs text-muted-foreground">+201 since last hour</p>
                </CardContent>
              </Card>
            </div>

            {/* Dashboard Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="relative">
                <ComponentId id="DASH-001" />
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>Monthly revenue trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area dataKey="revenue" fill="var(--color-revenue)" stroke="var(--color-revenue)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="relative">
                <ComponentId id="DASH-002" />
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
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
            <Card className="relative">
              <ComponentId id="DASH-003" />
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
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
                        item.status === 'success' ? 'text-green-500' :
                        item.status === 'warning' ? 'text-yellow-500' : 'text-blue-500'
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
