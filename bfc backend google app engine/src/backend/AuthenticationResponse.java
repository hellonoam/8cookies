package backend;

public class AuthenticationResponse {
	public static final int VALID = 0;
	public static final int DOESNOTEXIST = 1;
	public static final int WRONGPASS = 2;
	public static final int BLOCKED = 3;
	
	private int responseType;
	private long waitTime;
	public AuthenticationResponse(int responseType){
		this.responseType = responseType;
	}
	
	public AuthenticationResponse(int responseType, long waitTime){
		this.responseType = responseType;
		this.waitTime = waitTime;
	}
	
	public int getResponseType(){
		return responseType;
	}
	
	public long getWaitTime(){
		return waitTime;
	}
}
