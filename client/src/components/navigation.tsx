import { Link, useLocation } from "wouter";
import { Shield, Menu, X, Wallet, Check } from "lucide-react";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { minikit } from "@/lib/minikit";

export function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const queryClient = useQueryClient();
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const handleWalletConnect = useCallback(async () => {
    if (!minikit.isInstalled()) {
      alert("World App not installed. Please install World App to connect your wallet.");
      return;
    }

    if (isConnecting) return;

    setIsConnecting(true);
    try {
      // Authenticate wallet using World ID
      const result = await minikit.authenticateWallet("Connect to URSOL Insurance Platform");
      
      if (result?.success) {
        console.log("Wallet connected successfully:", result);
        setIsConnected(true);
        
        // Refresh user data after connection
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        
        // Send haptic feedback for success
        await minikit.sendHapticFeedback("light");
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
      alert("Failed to connect wallet. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, queryClient]);

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/policies", label: "Policies" },
    { href: "/staking", label: "Staking" },
    { href: "/borrowing", label: "Borrowing" },
    { href: "/claims", label: "Claims" },
    { href: "/beneficiaries", label: "Beneficiaries" },
  ];

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
              <Shield className="text-primary text-2xl" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                URSOL
              </span>
            </Link>
            
            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition-colors ${
                    location === item.href
                      ? "text-primary"
                      : "text-foreground hover:text-primary"
                  }`}
                  data-testid={`link-${item.label.toLowerCase()}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-muted px-3 py-1 rounded-full text-sm" data-testid="text-balance">
              <span className="text-muted-foreground">URSOL:</span>
              <span className="text-foreground font-medium ml-1">
                {(user as any)?.ursolBalance || "0.00"}
              </span>
            </div>
            
            <Button 
              className="hidden sm:flex" 
              onClick={handleWalletConnect}
              disabled={isConnecting}
              variant={isConnected ? "secondary" : "default"}
              data-testid="button-connect-wallet"
            >
              {isConnecting ? (
                <>
                  <Wallet className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : isConnected ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Connected
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`py-2 px-3 rounded-lg transition-colors ${
                    location === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  }`}
                  data-testid={`link-mobile-${item.label.toLowerCase()}`}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Connect Wallet button for mobile */}
              <Button 
                className="mt-4 w-full justify-start" 
                onClick={() => {
                  handleWalletConnect();
                  setIsMobileMenuOpen(false);
                }}
                disabled={isConnecting}
                variant={isConnected ? "secondary" : "default"}
                data-testid="button-mobile-connect-wallet"
              >
                {isConnecting ? (
                  <>
                    <Wallet className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : isConnected ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Connected
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
