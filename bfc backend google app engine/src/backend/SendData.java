package backend;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import javax.jdo.PersistenceManager;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import javax.jdo.Query;

import com.google.gson.JsonArray;


/**
 * My test servlet
 *
 * @author Noam Szpiro
 */

@SuppressWarnings("serial")
public class SendData extends HttpServlet {

    public void doGet(HttpServletRequest request,
                      HttpServletResponse response)
        throws IOException, ServletException
    {
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        PersistenceManager pm = PMF.get().getPersistenceManager();
        Query query = pm.newQuery(User.class);
        query.setFilter("username == usernameParam");
        try {
        	//TODO: make sure this is safe
        	List<User> userList = (List<User>) query.execute("hellonoam2");
        	if (userList.size() < 1){
        		out.println("ERROR: user unkonwn");
        		return;
        	}
        	User u = userList.get(0);
        	String cookiesString = u.getCookies();
        	if (cookiesString != null)
        		out.println(cookiesString);
    	} finally {
    		pm.close();
        }
    	out.close();
    }
}
