package backend;

import java.io.IOException;
import java.util.Properties;
import java.util.logging.Logger;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
/**
 * This servlet accepts beta signups
 * 
 * @author Noam Szpiro
 */
@SuppressWarnings("serial")
public class BetaSignUp extends HttpServlet {
	private Logger logger = Logger.getLogger(SignUp.class.getName()); 

    public void doGet(HttpServletRequest request,
                      HttpServletResponse response)
        throws IOException, ServletException
    {
    	logger.finest("inside do get");
    	String email = request.getParameter("email");
    	if (email != null && !email.equals("")){
    		logger.fine("email received " + email);
    		DatabaseInteraction.addBetaUser(email);
    		
    		//sending email
    		Properties props = new Properties();
            Session session = Session.getDefaultInstance(props, null);
            String msgBody = email;
            try {
                Message msg = new MimeMessage(session);
                msg.setFrom(new InternetAddress("hellonoam@gmail.com", "8cookies"));
                msg.addRecipient(Message.RecipientType.TO,
                                 new InternetAddress("noam@8cookies.com", "8cookies"));
                msg.setSubject("beta signup: " + email);
                msg.setText(msgBody);
                Transport.send(msg);
                logger.fine("email sent");
            } catch (AddressException e) {
            	logger.severe("send email failed: " + e.toString());
                e.printStackTrace();
            } catch (MessagingException e) {
            	logger.severe("send email failed: " + e.toString());
                e.printStackTrace();
            }
    	}
    }

    public void doPost(HttpServletRequest request,
                      HttpServletResponse response)
        throws IOException, ServletException
        {
    		logger.finest("inside do post");
    		doGet(request, response);
        }
}
