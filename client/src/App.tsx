import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Policies from "@/pages/policies";
import Staking from "@/pages/staking";
import Borrowing from "@/pages/borrowing";
import Beneficiaries from "@/pages/beneficiaries";
import Claims from "@/pages/claims";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/home" component={Home} />
      <Route path="/policies" component={Policies} />
      <Route path="/staking" component={Staking} />
      <Route path="/borrowing" component={Borrowing} />
      <Route path="/beneficiaries" component={Beneficiaries} />
      <Route path="/claims" component={Claims} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
