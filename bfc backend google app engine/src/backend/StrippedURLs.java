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
    	int start = 0;
		int end = 10;
    	try {
    		start = Integer.parseInt(request.getParameter("start")); 
    		end = Integer.parseInt(request.getParameter("end"));
    	} catch (NumberFormatException e) {
    		logger.severe(e.toString());
    	}
    	query.setRange(start, end);
    	try{
    		List<URL> urls = ((List<URL>) query.execute());
    		response.setContentType("text/html");
            PrintWriter out = response.getWriter();
            out.println("stripped urls: <br/>");
            out.println(urls.size() + "<br/>");
        	for (URL u: urls){
        		Query queryConvertedURL = pm.newQuery(ConvertedURL.class);
        		queryConvertedURL.setFilter("key == keyParam");
        		queryConvertedURL.declareParameters("String keyParam");
            	List<ConvertedURL> converted = ((List<ConvertedURL>) queryConvertedURL.execute(u.getKey()));
            	if (converted.size() == 0) {
            		String stripped = u.toString();
            		int httpIndex = stripped.indexOf("://");
            		int startIndex = httpIndex == -1 ? 0 : httpIndex + 3;
            		int endIndex = stripped.indexOf('/', startIndex);
            		if (endIndex == -1) endIndex = stripped.length();
            		stripped = stripped.substring(0, endIndex);
//        			out.print(stripped + "<br/>");
            		Query queryUnique = pm.newQuery(UniqueURL.class);
            		queryUnique.setFilter("URL == urlParam");
            		queryUnique.declareParameters("String urlParam");
            		List<UniqueURL> uniques = ((List<UniqueURL>) queryUnique.execute(stripped));
            		UniqueURL uu = null;
            		if (uniques.size() == 0) {
            			uu = new UniqueURL(stripped);
            		} else {
            			uu = uniques.get(0);
            			uu.incrementCoutner();
            		}
            		pm.makePersistent(new ConvertedURL(u.getKey()));
            		pm.makePersistent(uu);
            	}
        	}
    		out.println("done: from " + start + " till " + (urls.size() + start));
        	out.close();
    	} finally {
    		query.closeAll();
    		pm.close();
    	}
    }
}
