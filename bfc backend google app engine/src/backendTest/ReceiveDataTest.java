package backendTest;

import static org.mockito.Mockito.*;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

import com.google.appengine.repackaged.org.json.JSONException;
import com.google.appengine.repackaged.org.json.JSONObject;

import backend.DatabaseInteraction;
import backend.ReceiveData;
import backend.User;

@RunWith(PowerMockRunner.class)
@PrepareForTest(DatabaseInteraction.class)
public class ReceiveDataTest {

	private HttpServletRequest request;
	private HttpServletResponse response;
	private PrintWriter out;
	private String username;
	private String password;
	private User u;
	private String reqString;
	private JSONObject json;
	
	@Before
	public void setUp() throws IOException{
		json = mock(JSONObject.class);
		PowerMockito.mockStatic(DatabaseInteraction.class);
		request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        out = mock(PrintWriter.class);
        u = mock(User.class);
        username = "user1";
        password = "pass1";
        reqString = "{'cookies':[{'domain':'.google.com'}]}";
        
        //expectations
        when(request.getParameter("user")).thenReturn(username);
        when(request.getParameter("pass")).thenReturn(password);
        when(response.getWriter()).thenReturn(out);
	}

	@Test
	public void testBadData() throws IOException, ServletException{
		//expectations
        when(request.getParameter("dataFromClient")).thenReturn(null, "");
        when(request.getParameter("serial")).thenReturn("1");
        //TODO: check when string is definitely not a json

        //execute
        new ReceiveData().doPost(request, response);
        new ReceiveData().doPost(request, response);

        //verifiers
        verify(response, times(2)).sendError(HttpServletResponse.SC_BAD_REQUEST, 
		"data was not received in correct format");
        PowerMockito.verifyStatic(never());
        DatabaseInteraction.getUser(anyString());
	}

	@Test
	public void testInvalidUsernameOrPassword() throws IOException, ServletException{
		//expectations
        when(request.getParameter("dataFromClient")).thenReturn(reqString);
        Mockito.when(DatabaseInteraction.authenticate(username, password)).thenReturn(1,2);
        when(request.getParameter("serial")).thenReturn("1");
        
        //execute
        new ReceiveData().doPost(request, response);
        new ReceiveData().doPost(request, response);
        
        //verifiers
        verify(response, times(2)).sendError(
        		HttpServletResponse.SC_UNAUTHORIZED, "received incorrect credentials");;
        PowerMockito.verifyStatic(never());
        DatabaseInteraction.getUser(anyString());
	}

	private void setUpForTestUpdate(boolean update) throws IOException, ServletException{
		//expectations
        when(request.getParameter("dataFromClient")).thenReturn(reqString);
        when(DatabaseInteraction.authenticate(username, password)).thenReturn(0);
        when(DatabaseInteraction.getUser(username)).thenReturn(u);
        when(DatabaseInteraction.updateOrSaveUser(u)).thenReturn(update);
        when(request.getParameter("serial")).thenReturn("1");

        //execute
        new ReceiveData().doPost(request, response);
        
        //verifiers
        verify(u).setInfo(reqString);
	}

	@Test
	public void testUpdatefailed() throws IOException, ServletException{
		setUpForTestUpdate(false);

		//verifiers
        verify(response, never()).setContentType(anyString());
        verify(response).sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "faild to update/save user");
	}

	@Test
	public void testUpdateSucceeded() throws IOException, ServletException{
		setUpForTestUpdate(true);
		
		//verifiers
        verify(response).setContentType(anyString());
        verify(out).println("received");
        verify(out).close();
        verify(response, never()).sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "faild to update/save user");
	}

	@Test
	public void testSerial() throws IOException, ServletException{
		when(request.getParameter("serial")).thenReturn("5");
		when(request.getParameter("dataFromClient")).thenReturn(reqString);
		when(DatabaseInteraction.getUser(username)).thenReturn(u);
		when(DatabaseInteraction.authenticate(username, password)).thenReturn(0);
		when(DatabaseInteraction.newJSONInstance()).thenReturn(json);
		String info = "info";
		String salt = "salt";
		when(u.getInfo()).thenReturn(info);
		when(u.getSalt()).thenReturn(salt);
		when(u.getSerial()).thenReturn(3);
		
		//execute
        new ReceiveData().doPost(request, response);
        
        //verifiers
        try {
			verify(json).append("info", info);
			verify(json).append("salt", salt);
		} catch(JSONException e) {
			e.printStackTrace();
		}
		verify(response).setContentType("text/html");
		verify(out).println(json);
		verify(out).close();
	}

	@Test
	public void testNoSerialReceived() throws IOException, ServletException{
		
		//execute
        new ReceiveData().doPost(request, response);
        
        //verifiers
        verify(response).sendError(HttpServletResponse.SC_CONFLICT, "serial conflict - update was rejected");
	}
}
