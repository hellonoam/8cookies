import java.io.IOException;
import java.io.PrintWriter;
import java.util.logging.FileHandler;
import java.util.logging.Handler;
import java.util.logging.Logger;

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
	public static JsonArray cookies;
	public static Logger logger = Logger.getLogger(ReceiveData.class.getName()); 

    public void doGet(HttpServletRequest request,
                      HttpServletResponse response)
        throws IOException, ServletException
    {
    	logger.severe("inside do get");
    	JsonParser jp = new JsonParser();
    	//reading the cookies as json
    	JsonElement json = jp.parse(request.getParameter("cookiesFromClient").toString());
    	Handler fileHandler = new FileHandler(
    			"/Users/noamszpiro/Dropbox/Part II Project/code/" +
    			"Browsing-from-the-cloud/backend/log/ReceivedData.log");
    	logger.addHandler(fileHandler);
    	logger.severe("XXXXXXXX - JSON - XXXXXXXXX");
    	if (!json.isJsonArray())
    		logger.severe("json was not an array");
    	else
    		logger.severe("cookies received successfully");
    	JsonArray ja = json.getAsJsonArray();
    	//The cookies are now in this array

    	cookies = ja;   	

    	//sending the response
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        out.println("received!");
		out.close();
    }
    
    public void doPost(HttpServletRequest request,
                      HttpServletResponse response)
        throws IOException, ServletException
        {
    		logger.severe("inside do post");
    		doGet(request, response);
        }
}
