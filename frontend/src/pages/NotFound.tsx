
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-lg">
        <div className="mb-6">
          <div className="relative h-40">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-[120px] font-bold text-farm-green-200">404</div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl font-bold text-farm-green-700">Oops!</div>
            </div>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-6">
          We couldn't find the page you were looking for at{" "}
          <code className="px-1 py-0.5 bg-muted rounded text-sm">
            {location.pathname}
          </code>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
          <Button asChild>
            <Link to="/">Return to Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/sheep">View Sheep</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
