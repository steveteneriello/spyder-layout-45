
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, TrendingUp, DollarSign, Eye } from 'lucide-react';
import { useCampaignKeywords } from '@/hooks/useCampaignKeywords';

interface CampaignKeywordsProps {
  campaignId: string;
}

export function CampaignKeywords({ campaignId }: CampaignKeywordsProps) {
  const { keywords, negativeKeywords, addKeyword, removeKeyword, loading } = useCampaignKeywords(campaignId);
  const [newKeyword, setNewKeyword] = useState('');
  const [keywordType, setKeywordType] = useState<'positive' | 'negative'>('positive');

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      addKeyword(newKeyword.trim(), 'broad', keywordType);
      setNewKeyword('');
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return `$${value.toFixed(2)}`;
  };

  const formatPercentage = (value?: number) => {
    if (!value) return '-';
    return `${(value * 100).toFixed(2)}%`;
  };

  const KeywordTable = ({ data, type }: { data: any[], type: 'positive' | 'negative' }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Keyword</TableHead>
          {type === 'positive' && (
            <>
              <TableHead>Impressions</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>CTR</TableHead>
              <TableHead>CPC</TableHead>
              <TableHead>Cost</TableHead>
            </>
          )}
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.keyword}</TableCell>
            {type === 'positive' && item.stats && (
              <>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3 text-muted-foreground" />
                    {item.stats.impressions?.toLocaleString() || '-'}
                  </div>
                </TableCell>
                <TableCell>{item.stats.clicks?.toLocaleString() || '-'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    {formatPercentage(item.stats.ctr)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    {formatCurrency(item.stats.cpc)}
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(item.stats.total_cost)}</TableCell>
              </>
            )}
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeKeyword(item.id, type)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {data.length === 0 && (
          <TableRow>
            <TableCell colSpan={type === 'positive' ? 7 : 2} className="text-center py-8 text-muted-foreground">
              No {type} keywords found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  if (loading) {
    return <div className="text-center py-8">Loading keywords...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add New Keyword */}
      <Card>
        <CardHeader>
          <CardTitle>Add Keywords</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                placeholder="Enter keyword"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
              />
            </div>
            <div className="w-32">
              <Select value={keywordType} onValueChange={(value) => setKeywordType(value as 'positive' | 'negative')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddKeyword} disabled={!newKeyword.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Keywords Tabs */}
      <Tabs defaultValue="positive" className="w-full">
        <TabsList>
          <TabsTrigger value="positive">
            Positive Keywords ({keywords.length})
          </TabsTrigger>
          <TabsTrigger value="negative">
            Negative Keywords ({negativeKeywords.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="positive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Positive Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <KeywordTable data={keywords} type="positive" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="negative" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Negative Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <KeywordTable data={negativeKeywords} type="negative" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
