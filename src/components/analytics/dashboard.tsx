import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownRight, Users, Wallet, Compass as GasPump } from 'lucide-react';
import type { AnalyticsData, TokenPrice } from '@/lib/types';

interface DashboardProps {
  analytics: AnalyticsData;
  tokenPrices: TokenPrice[];
}

const SAMPLE_TVL_DATA = [
  { name: 'Jan', value: 1000000 },
  { name: 'Feb', value: 1500000 },
  { name: 'Mar', value: 1250000 },
  { name: 'Apr', value: 2000000 },
];

export function Dashboard({ analytics, tokenPrices }: DashboardProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value Locked</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.tvl.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.volume24h.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12.5% from yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activeUsers24h.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+5.2% from yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gas Used</CardTitle>
              <GasPump className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.gasUsed24h.toLocaleString()} ETH</div>
              <p className="text-xs text-muted-foreground">Average 45 gwei</p>
            </CardContent>
          </Card>
        </div>

        {/* TVL Chart */}
        <Card>
          <CardHeader>
            <CardTitle>TVL History</CardTitle>
            <CardDescription>Total value locked over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SAMPLE_TVL_DATA}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Token Prices */}
        <Card>
          <CardHeader>
            <CardTitle>Token Prices</CardTitle>
            <CardDescription>Latest token prices and 24h changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tokenPrices.map((token) => (
                <div key={token.symbol} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="font-medium">{token.symbol}</div>
                    <div className="text-sm text-muted-foreground">${token.price.toFixed(2)}</div>
                  </div>
                  <Badge variant={token.change24h >= 0 ? 'default' : 'destructive'}>
                    {token.change24h >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(token.change24h)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}