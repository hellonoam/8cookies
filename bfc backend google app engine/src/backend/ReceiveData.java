package backend;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.LinkedList;
import java.util.List;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;

/**
 * My test servlet
 *
 * @author Noam Szpiro
 */

@SuppressWarnings("serial")
public class ReceiveData extends HttpServlet {
	public static Logger logger = Logger.getLogger(ReceiveData.class.getName()); 

    public void doGet(HttpServletRequest request,
                      HttpServletResponse response)
        throws IOException, ServletException
    {
    	logger.severe("inside do get");
    	JsonParser jp = new JsonParser();
    	//reading the cookies as json
    	String reqString = request.getParameter("cookiesFromClient");
    	JsonElement json = jp.parse(reqString == null ? "" : reqString);
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
    	if (!json.isJsonArray()) {
    		logger.severe("json was not an array");
    		out.println("cookies were not received!");
    		out.close();
    		//TODO: close the servlet here!!!! something like system.exit
    	} else {
    		logger.severe("cookies received successfully");
    		JsonArray ja = json.getAsJsonArray();
    		List<Cookie> cookiesList = new LinkedList<Cookie>();
    		for (int i=0; i<ja.size(); i++){
    			cookiesList.add(new Cookie(ja.get(i).toString()));
    		}
    		ReceiveData.logger.severe("cookiesList.length: " + cookiesList.size());
//    		User u = new User("hellonoam", "pass", cookiesList);
    		User u = new User("hellonoam2", "pass", reqString);
    		PersistenceManager pm = PMF.get().getPersistenceManager();
    		try {
    			pm.makePersistent(u);
    			ReceiveData.logger.severe("entry added to db");
    		} finally {
    			pm.close();
    		}
    		//sending the response
    		out.println("received!");
    		out.close();
    	}
    }
    
    public void doPost(HttpServletRequest request,
                      HttpServletResponse response)
        throws IOException, ServletException
        {
    		logger.severe("inside do post");
    		doGet(request, response);
        }
}
