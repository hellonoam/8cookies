import java.io.BufferedReader;
import java.io.CharArrayWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.logging.FileHandler;
import java.util.logging.Handler;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.JsonElement;
import com.google.gson.JsonParser;

/**
 * My test servlet
 *
 * @author Noam Szpiro
 */

@SuppressWarnings("serial")
public class ReceiveData extends HttpServlet {
	
	private final static int buffer_size = 4096;
	private static Logger logger = Logger.getLogger(ReceiveData.class.getName()); 

    public void doGet(HttpServletRequest request,
                      HttpServletResponse response)
        throws IOException, ServletException
    {
    	//reading the request
//    	request.setCharacterEncoding("text/html");
    	BufferedReader br = request.getReader();
    	CharArrayWriter data = new CharArrayWriter();
    	char[] buf = new char[buffer_size]; 
    	int read;
    	while((read = br.read(buf, 0, buffer_size)) != -1)
    		data.write(buf, 0, read);
    	//data now holds the values sent from client
    	
    	//converting data to JSON
    	JsonParser jp = new JsonParser();
    	JsonElement json = jp.parse(data.toString());
    	Handler fileHandler = new FileHandler(
    			"/Users/noamszpiro/Dropbox/Part II Project/code/" +
    			"Browsing-from-the-cloud/backend/log/ReceivedData.log");
    	logger.addHandler(fileHandler);
    	logger.severe("json:" + json.toString());
    	
    	//sending the response
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        out.println("received");
		out.close();
    }
}