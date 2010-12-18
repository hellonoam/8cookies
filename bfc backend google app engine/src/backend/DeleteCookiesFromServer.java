package backend;
import java.io.IOException;
import java.io.PrintWriter;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


/**
 * My test servlet
 *
 * @author Noam Szpiro
 */

@SuppressWarnings("serial")
public class DeleteCookiesFromServer extends HttpServlet {

    public void doGet(HttpServletRequest request,
                      HttpServletResponse response)
        throws IOException, ServletException
    {
        response.setContentType("text/html");
        PersistenceManager pm = PMF.get().getPersistenceManager();
        Query queryCookie = pm.newQuery("select from " + Cookie.class.getName());
        Query queryUser = pm.newQuery("select from " + User.class.getName());
        try{
        	queryCookie.deletePersistentAll();
        	queryUser.deletePersistentAll();
        	ReceiveData.logger.severe("all cookies deleted");
    	} finally {
    		pm.close();
        }
    }
}
