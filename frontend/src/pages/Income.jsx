import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockTransactions } from "@/data/mockData";
import { Filter, Plus, Search, TrendingUp } from "lucide-react";
import { useState } from "react";

const Income = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  const income = mockTransactions
    .filter(t => t.type === "income")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredIncome = income.filter(incomeItem => {
    const matchesSearch = incomeItem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incomeItem.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || incomeItem.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(income.map(i => i.category))];
  const totalIncome = filteredIncome.reduce((sum, incomeItem) => sum + incomeItem.amount, 0);

  const getCategoryColor = (category) => {
  const colors = {
    'Salary': 'bg-green-100 text-green-800',
    'Freelance': 'bg-blue-100 text-blue-800',
    'Investment': 'bg-purple-100 text-purple-800',
    'Other': 'bg-gray-100 text-gray-800',
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Income</h1>
          <p className="text-muted-foreground">Track and manage all your income sources</p>
        </div>
        <Button variant="success" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Income
        </Button>
      </div>

      {/* Stats */}
      <Card className="border-0 shadow-md bg-gradient-to-br from-success-light to-success-light/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success rounded-lg">
              <TrendingUp className="h-6 w-6 text-success-foreground" />
            </div>
            <div>
              <p className="text-sm text-success/70">Total Filtered Income</p>
              <p className="text-3xl font-bold text-success">${totalIncome.toFixed(2)}</p>
              <p className="text-sm text-success/70">{filteredIncome.length} transactions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search income..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Income List */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>All Income</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredIncome.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No income found matching your criteria</p>
              </div>
            ) : (
              filteredIncome.map((incomeItem) => (
                <div 
                  key={incomeItem.id} 
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{incomeItem.description}</h3>
                      <Badge className={getCategoryColor(incomeItem.category)}>
                        {incomeItem.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(incomeItem.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-success">
                      +${incomeItem.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Income;