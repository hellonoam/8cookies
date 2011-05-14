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

public class UserStorageDetails extends HttpServlet {
	private Logger logger = Logger.getLogger(StrippedURLs.class.getName()); 

    public void doGet(HttpServletRequest request,
                      HttpServletResponse response)
        throws IOException, ServletException
    {
    	PersistenceManager pm = PMF.get().getPersistenceManager();
    	Query query = pm.newQuery(User.class);
    	List<User> answer = ((List<User>) query.execute());
    	response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        out.print("user storage:<br/>");
    	for (User u: answer){
    		out.println(u.getInfo().length() + "<br/>");
    	}
    	out.close();
    }
}
