package backend;

import java.util.LinkedList;
import java.util.List;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.Text;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

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

//    public User(String username, String password, List<Cookie> cookies) {
//        this.username = username;
//        this.password = password;
//        this.cookies = new LinkedList<Cookie>();
//        for (Cookie c: cookies){
//        	this.cookies.add(c);
//        }
//    }
    
    public User(String username, String password, String email, String info) {
      this.username = username;
      this.password = password;
      this.email = email;
      this.info = new Text(info);
    }

    public Key getKey() {
        return key;
    }

    public String getUsername() {
        return username;
    } 

    public String getPassword(){
    	return password;
    }
    
    public String getInfo(){
    	return info.getValue();
    }

	public void setInfo(String reqString) {
		this.info = new Text(reqString);
		
	}

}