package backend;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.Text;

import java.text.DateFormat;
import java.text.ParseException;
import java.util.Calendar;
import java.util.Date;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import java.security.SecureRandom;
import BCrypt.BCrypt;

@PersistenceCapable
public class User {
    @PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    private Key key;

    @Persistent
    private String username;

    @Persistent
    private Text info;
    
    @Persistent
    private String password;
    
    @Persistent
    private String email;
    
    @Persistent
    private String salt;
    
    @Persistent
    private int serial;
    
    @Persistent
    private Date lastFailedAttempt;
    
    @Persistent
    private Date lastSuccessfulLogin;
    
    //when should the next try be in milliseconds
    @Persistent
    private long nextTryIn = 0;
    
    @Persistent
    private int loginTries;
    
    private final int entropy = 8;
    
    public User(String username, String plainTextPass, String email, String info) {
      this.username = username == null ? "" : username;
      plainTextPass = plainTextPass == null ? "" : plainTextPass;
      this.password = BCrypt.hashpw(plainTextPass, BCrypt.gensalt());
      this.email = email == null ? "" : email;
      this.info = new Text(info == null ? "" : info);
      generateSalt();
      this.serial = 0;
    }
    
    private void generateSalt(){
    	byte randArr[] = new byte[entropy];
        new SecureRandom().nextBytes(randArr);
        this.salt = "";
        for (int i=0; i<randArr.length; i++)
      	  this.salt += (char) Math.abs(randArr[i]);
    }
    
    public String getSalt(){
    	if (salt == null)
    		throw new IllegalArgumentException("no salt found associated with user"); 
    	return salt;
    }
    
    public long getWaitTime(){
    	return nextTryIn; 
    }
    
    public void updateSuccessLoginTime(){
    	lastSuccessfulLogin = Calendar.getInstance().getTime();
    }
    
	public void blockTry() {
		nextTryIn = (long) (nextTryIn == 0 ? 600 : nextTryIn * 2);
	}
    
	public boolean canTryPasswordNow() {
		if (nextTryIn == 0)
			return true;
		Calendar cal = Calendar.getInstance();
		cal.setTimeInMillis(cal.getTimeInMillis() - nextTryIn*1000);
		if (cal.getTime().before(lastFailedAttempt))
			return false;
		resetLoginTries();
		return true;
	}
	
    public boolean loginTriesOverLimit(){
    	return loginTries >= 3;
    }
    
    public void incrementLoginTriesAndUpdateTime(){
		lastFailedAttempt = Calendar.getInstance().getTime();
		loginTries++;
	}
    
    public void resetLoginTries(){
    	loginTries = 0;
    	nextTryIn = 0;
    }
    
    public int getSerial(){
    	return serial;
    }
    
    public void incrementSerial(){
    	serial++;
    }
    
    public void setSerial(int serial){
    	this.serial = serial;
    }
    
    public void resetSerial(){
    	serial = 0;
    }

    public Key getKey() {
        return key;
    }

    public String getUsername() {
        return username;
    } 

    public String getEmail(){
    	return email;
    }
    
    public boolean comparePassword(String plainTextPass){
    	return BCrypt.checkpw(plainTextPass, password);
    }
    
    public String getInfo(){
    	return info.getValue();
    }

	public void setInfo(String reqString) {
		this.info = new Text(reqString);
		
	}
}