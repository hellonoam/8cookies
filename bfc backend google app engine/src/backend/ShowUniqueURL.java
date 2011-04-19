package backend;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class ShowUniqueURL extends HttpServlet {
	private Logger logger = Logger.getLogger(ShowUniqueURL.class.getName()); 

    public void doGet(HttpServletRequest request,
                      HttpServletResponse response)
        throws IOException, ServletException
    {
    	PersistenceManager pm = PMF.get().getPersistenceManager();
    	Query query = pm.newQuery(UniqueURL.class);
    	query.setOrdering("counter descending");
    	try{
    		List<UniqueURL> urls = ((List<UniqueURL>) query.execute());
    		response.setContentType("text/html");
            PrintWriter out = response.getWriter();
            out.println("unique urls: <br/>");
            out.println(urls.size() + "<br/>");
        	for (UniqueURL u: urls){
        		out.println(u.toString() + " <br/>");
        	}
        	out.close();
    	} finally {
    		query.closeAll();
    		pm.close();
    	}
    }
}
