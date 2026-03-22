import threading
import time
from core.logger import logger

class PacketSniffer:
    def __init__(self):
        self.active = False
        self.sniff_thread = None
        self.burst_bytes = 0
        self.burst_count = 0

    def _sniff_loop(self):
        try:
            # Import inside thread to prevent crashing if scapy isn't installed/fails early
            from scapy.all import sniff, IP
            
            def packet_callback(packet):
                if IP in packet:
                    self.burst_bytes += len(packet)
                    self.burst_count += 1
            
            logger.info("[Ingestion] Initializing Live Packet Sniffing via Scapy...")
            # Run sniff in a loop allowing us to stop it if needed
            sniff(prn=packet_callback, store=0, stop_filter=lambda p: not self.active)
        except ImportError:
            logger.error("[Ingestion] Scapy not installed. Falling back to synthetic stream.")
            self.active = False
        except Exception as e:
            logger.error(f"[Ingestion] Live Packet Sniffing failed (Root/Admin privilege likely required): {e}. Falling back to synthetic stream.")
            self.active = False

    def start(self):
        if not self.active:
            self.active = True
            self.sniff_thread = threading.Thread(target=self._sniff_loop, daemon=True, name="ScapySniffer")
            self.sniff_thread.start()

    def stop(self):
        self.active = False

    def get_burst_metrics(self):
        """Returns traffic volume and count over the last interval"""
        b_bytes = self.burst_bytes
        b_count = self.burst_count
        self.burst_bytes = 0
        self.burst_count = 0
        return float(b_bytes), int(b_count)

sniffer = PacketSniffer()
