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

public class StrippedURLs extends HttpServlet {
	private Logger logger = Logger.getLogger(StrippedURLs.class.getName()); 

    public void doGet(HttpServletRequest request,
                      HttpServletResponse response)
        throws IOException, ServletException
    {
    	PersistenceManager pm = PMF.get().getPersistenceManager();
    	Query query = pm.newQuery(URL.class);
    	List<URL> urls = null;
    	try{
    		urls = ((List<URL>) query.execute());
    		response.setContentType("text/html");
            PrintWriter out = response.getWriter();
            out.println("stripped urls: <br/>");
            out.println(urls.size() + "<br/>");
        	for (URL u: urls){
        		out.print(u.toString() + "<br/>");
        	}
        	out.println(urls.size());
        	out.close();
    	} finally {
    		query.closeAll();
    		pm.close();
    	}
    }
}
