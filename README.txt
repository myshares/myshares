--------------------------------------------------------------------------------------------------------------
MyShare is a cryptocurrency based on PoS (Proof Of Stake) algorithm. 

MyShare aimed to free user from expensive FEE for all transaction as low as 0.1 MYS.

What is PoS? 
https://youtu.be/NqgzF63yNcU
https://blockgeeks.com/guides/proof-of-work-vs-proof-of-stake/

The different algorithms used allow MyShare users to mine with exponentially less computing power. MyShare uses Proof of Stake (PoS), a concept initially pioneered by Peercoin, rather than Proof of Work, used by Bitcoin and other coins.
 
MyShare VS NXT 
All transaction FEE in MyShare is : 0.1 MYS
All transaction FEE in NXT        : 1 NXT (More expensive compare to MyShare) 

Asset Issuance FEE in MyShare is : 300 MYS 
Asset Issuance FEE in NXT is     : 1000 NXT (More expensive compare to MyShare)

Total MyShare coin supply : 2000000000 MYS 
Total NXT coin supply     : 1000000000 NXT

Minimal Forging : 
NXT : 1000 NXT (effective balance)
MyShare : 1 MYS (effective balance)

All of the coin will be supplied to all first attempt buyer at https://bitcointalk.org/ and https://cryptocurrencytalk.com ,please stay tuned for more info by watching (press the watch button) top right at this github repo.

-------------------------------------------------------------------------------------------------------------------------------
Online wallet: 
English : http://www.myshares.club/
Chinese : http://ch.myshares.club/

Test Wallet: 
English : http://test.myshares.club/
Chinese : http://test.ch.myshares.club/

Alternate link online wallet:
http://www.nxlcrypto.life/
http://ch.nxlcrypto.life/

Test wallet: 
http://test.nxlcrypto.life/
http://test.ch.nxlcrypto.life/

Or alternatively you can download the wallet at the release tab of this repo. MyShare desktop wallet also supports English and Chinese language.

-------------------------------------------------------------------------------------------------------------------------------
The exchange is in progress, please stay tuned for more info by watching (press the watch button) top right at this github repo.
-------------------------------------------------------------------------------------------------------------------------------

Running the MyShare software:

Dependencies: Java 7 or later needs to be installed first. Only the Oracle JVM
has been tested and supported.

There is no installation needed. Unpack the mys-client.zip package and open a
shell in the resulting mys directory. Execute the run.sh script if using Linux,
or run.bat if using Windows. This will start a java server process, which will
begin logging its activities to the console. The initialization takes a few
seconds. When it is ready, you should see the message "MyShare server 1.0.0 started
successfully". Open a browser, without stopping the java process, and go to
http://localhost:14725 , where the MyShare UI should now be available. To stop the
application, type Ctrl-C inside the console window.


Customization:

There are many configuration parameters that could be changed, but the defaults
are set so that normally you can run the program immediately after unpacking,
without any additional configuration. To see what options are there, open the
conf/nxt-default.properties file. All possible settings are listed, with
detailed explanation. If you decide to change any setting, do not edit
nxt-default.properties directly, but create a new conf/nxt.properties file
and only add to it the properties that need to be different from the default
values. You do not need to delete the defaults from nxt-default.properties, the
settings in nxt.properties override those in nxt-default.properties. This way,
when upgrading the software, you can safely overwrite nxt-default.properties
with the updated file from the new package, while your customizations remain
safe in the nxt.properties file.

-----------------------------------------------------------------------------------------------------------------
Enabling Chinese language: 
at nxt-default.properties search for chinese language and remote the '#' before nxt.apiResourceBase=html/ui_zh
and put '#' before nxt.apiResourceBase=html/ui

It should be like below: 

# Directory with html and javascript files for the new client UI, and admin tools utilizing
# the http/json API.
#nxt.apiResourceBase=html/ui

#for Chinese language 
nxt.apiResourceBase=html/ui_zh
-----------------------------------------------------------------------------------------------------------------

Technical details:

The MyShare software is a client-server application. It consists of a java server
process, the one started by the run.sh script, and a javascript user interface
run in a browser. To run a node, forge, update the blockchain, interact with
peers, only the java process needs to be running, so you could logout and close
the browser but keep the java process running. If you want to keep forging, make
sure you do not click on "stop forging" when logging out. You can also just
close the browser without logging out.

The java process communicates with peers on port 7874 tcp by default. If you are
behind a router or a firewall and want to have your node accept incoming peer
connections, you should setup port forwarding. The server will still work though
even if only outgoing connections are allowed, so opening this port is optional.

The user interface is available on port 14725. This port also accepts http API
requests which other MyShare client applications could use.

The blockchain is stored on disk using the H2 embedded database, inside the
nxl_db directory. When upgrading, you should not delete the old nxl_db
directory, upgrades always include code that can upgrade old database files to
the new version whenever needed. But there is no harm if you do delete the
nxl_db, except that it will take some extra time to download the blockchain
from scratch.

The default MyShare client does not store any wallet-type file on disk. Unlike
bitcoin, your password is the only thing you need to get access to your account,
and is the only piece of data you need to backup or remember. This also means
that anybody can get access to your account with only you password - so make
sure it is long and random. A weak password will result in your funds being
stolen immediately.

The java process logs its activities and error messages to the standard output
which you see in the console window, but also to a file mys.log, which gets
overwritten at restart. In case of an error, the mys.log file may contain
helpful information, so include its contents when submitting a bug report.

In addition to the default user interface at http://localhost:14725 , the
following urls are available:

http://localhost:14725/test - a list of all available http API requests, very
useful for client developers and for anyone who wants to execute commands
directly using the http interface without going through the browser UI.

http://localhost:14725/test?requestType=<specificRequestType> - same as above,
but only shows the form for the request type specified.

http://localhost:14725/doc - a javadoc documentation for client developers who
want to use the Java API directly instead of going through the http interface.

http://localhost:14725/admin.html - some more commonly used commands, using the
http interface.


Compiling:

The source is included in the src subdirectory. To compile it on linux, just
run the enclosed compile.sh script. This will compile all java classes and
package them in an nxl.jar file, replacing the existing one.


